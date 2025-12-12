import { useState } from 'react'
import { Team, MatchState, GameState, Player } from './types'
import { TEAMS, createPlayer } from './data/mockData'
import { simulateBall } from './engine/matchEngine'
import './App.css'

type Screen = 'MENU' | 'NEW_CAREER' | 'CAREER' | 'MATCH' | 'POST_MATCH';

function App() {
  const [screen, setScreen] = useState<Screen>('MENU');
  
  // Career State
  const [careerState, setCareerState] = useState<GameState | null>(null);
  
  // Match Context
  const [playerTeam, setPlayerTeam] = useState<Team>(TEAMS[0]);
  const [opponentTeam, setOpponentTeam] = useState<Team>(TEAMS[1]);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [commentary, setCommentary] = useState<string[]>([]);
  
  // New Player Form
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<Player['role']>("Batsman");

  const startCareerSetup = () => {
    setNewPlayerName("");
    setScreen('NEW_CAREER');
  };

  const saveCareer = () => {
      if (careerState) {
          localStorage.setItem('careerSave', JSON.stringify(careerState));
          alert('Game Saved!');
      }
  };

  const loadCareer = () => {
      const save = localStorage.getItem('careerSave');
      if (save) {
          const loaded = JSON.parse(save);
          setCareerState(loaded);
          // Restore team references
          const myTeam = loaded.teams.find((t: Team) => t.id === loaded.currentTeamId);
          setPlayerTeam(myTeam);
          setOpponentTeam(TEAMS[1]); // Simplified: always play Team B for now
          setScreen('CAREER');
      } else {
          alert('No save game found!');
      }
  };

  const createCareer = () => {
      if (!newPlayerName) return;
      const newPlayer = createPlayer('my_player', newPlayerName, newPlayerRole, 70, 70);
      
      // Inject player into Team A
      const startingTeam: Team = { 
          ...TEAMS[0], 
          players: [newPlayer, ...TEAMS[0].players.slice(1)] 
      };
      
      const newCareer: GameState = {
          player: newPlayer,
          currentTeamId: startingTeam.id,
          teams: [startingTeam, TEAMS[1]],
          date: new Date().toISOString(),
          matchesHistory: []
      };
      
      setCareerState(newCareer);
      setPlayerTeam(startingTeam);
      setOpponentTeam(TEAMS[1]);
      setScreen('CAREER');
  };

  const startMatch = () => {
    setMatchState({
      battingTeamId: playerTeam.id,
      bowlingTeamId: opponentTeam.id,
      currentInnings: 1,
      score: {
        [playerTeam.id]: { runs: 0, wickets: 0, overs: 0 },
        [opponentTeam.id]: { runs: 0, wickets: 0, overs: 0 }
      },
      currentOver: [],
      strikerId: playerTeam.players[0].id,
      nonStrikerId: playerTeam.players[1].id,
      bowlerId: opponentTeam.players[10].id, // Last bowler
      isCompleted: false
    });
    setCommentary(["Match Started!"]);
    setScreen('MATCH');
  };

  const playBall = () => {
    if (!matchState || matchState.isCompleted) return;

    const battingTeam = matchState.battingTeamId === playerTeam.id ? playerTeam : opponentTeam;
    const bowlingTeam = matchState.bowlingTeamId === playerTeam.id ? playerTeam : opponentTeam;

    const batsman = battingTeam.players.find(p => p.id === matchState.strikerId)!;
    const bowler = bowlingTeam.players.find(p => p.id === matchState.bowlerId)!;

    const result = simulateBall(batsman, bowler);
    
    // Update State
    const newScore = { ...matchState.score };
    const currentTeamScore = newScore[matchState.battingTeamId];
    
    currentTeamScore.runs += result.runs;
    if (result.isWicket) {
      currentTeamScore.wickets += 1;
    }

    // Over calculation
    const currentOver = [...matchState.currentOver, result];
    if (currentOver.length === 6) {
      currentTeamScore.overs += 1;
    }

    const newCommentary = [`${bowler.name} to ${batsman.name}: ${result.description}`, ...commentary];

    // Check innings end
    const MAX_OVERS = 5;
    let isCompleted = false;
    let nextInnings = matchState.currentInnings;
    let winnerId = undefined;

    // Check if over finished
    if (currentOver.length === 6) {
        if (currentTeamScore.overs >= MAX_OVERS || currentTeamScore.wickets >= 10) {
            if (matchState.currentInnings === 1) {
                nextInnings = 2;
                // Swap teams
                setMatchState(prev => prev ? ({
                    ...prev,
                    score: newScore,
                    battingTeamId: prev.bowlingTeamId,
                    bowlingTeamId: prev.battingTeamId,
                    currentInnings: 2,
                    currentOver: [],
                    strikerId: bowlingTeam.players[0].id,
                    nonStrikerId: bowlingTeam.players[1].id,
                    bowlerId: battingTeam.players[10].id,
                    target: currentTeamScore.runs + 1
                }) : null);
                setCommentary([`Innings Break! Target: ${currentTeamScore.runs + 1}`, ...newCommentary]);
                return;
            } else {
                isCompleted = true;
            }
        }
    }

    // Check victory
    if (matchState.currentInnings === 2 && matchState.target && currentTeamScore.runs >= matchState.target) {
        isCompleted = true;
        winnerId = matchState.battingTeamId;
    }
    
    // Check all out 2nd innings
    if (matchState.currentInnings === 2 && currentTeamScore.wickets >= 10) {
        isCompleted = true;
         // If runs < target, bowling team wins
         if (matchState.target && currentTeamScore.runs < matchState.target) {
             winnerId = matchState.bowlingTeamId;
         }
    }
    
    // Check overs end 2nd innings and run check
    if (matchState.currentInnings === 2 && isCompleted && !winnerId && matchState.target) {
         if (currentTeamScore.runs >= matchState.target) winnerId = matchState.battingTeamId;
         else winnerId = matchState.bowlingTeamId;
    }

    // Rotate strike
    let nextStriker = matchState.strikerId;
    let nextNonStriker = matchState.nonStrikerId;

    if (result.runs % 2 !== 0) {
        [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
    }
    
    // Wicket handling
    if (result.isWicket) {
         const nextBatIndex = currentTeamScore.wickets + 1; // already incremented
         if (nextBatIndex < 11) {
             nextStriker = battingTeam.players[nextBatIndex].id;
         } else {
             // All out logic handled above partially, but need to break if 1st innings
             if (matchState.currentInnings === 1) {
                  nextInnings = 2;
                  setMatchState(prev => prev ? ({
                    ...prev,
                    score: newScore,
                    battingTeamId: prev.bowlingTeamId,
                    bowlingTeamId: prev.battingTeamId,
                    currentInnings: 2,
                    currentOver: [],
                    strikerId: bowlingTeam.players[0].id,
                    nonStrikerId: bowlingTeam.players[1].id,
                    bowlerId: battingTeam.players[10].id,
                    target: currentTeamScore.runs + 1
                }) : null);
                setCommentary([`All Out! Innings Break! Target: ${currentTeamScore.runs + 1}`, ...newCommentary]);
                return;
             } else {
                 isCompleted = true;
             }
         }
    }

    // Over end rotate strike and change bowler
    let nextBowler = matchState.bowlerId;
    let nextOverState = currentOver;
    if (currentOver.length === 6) {
        [nextStriker, nextNonStriker] = [nextNonStriker, nextStriker];
        nextOverState = [];
        // Change bowler
        const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === matchState.bowlerId);
        const nextBowlerIndex = (bowlerIndex - 1 < 6) ? 10 : bowlerIndex - 1; 
        nextBowler = bowlingTeam.players[nextBowlerIndex].id;
    }

    setMatchState(prev => prev ? ({
        ...prev,
        score: newScore,
        currentOver: nextOverState,
        strikerId: nextStriker,
        nonStrikerId: nextNonStriker,
        bowlerId: nextBowler,
        isCompleted,
        winnerId,
        currentInnings: nextInnings as 1 | 2
    }) : null);
    
    setCommentary(newCommentary);

    if (isCompleted) {
        setScreen('POST_MATCH');
    }
  };
  
  const finishMatch = () => {
     if (careerState && matchState) {
          const updatedPlayer = { ...careerState.player };
          updatedPlayer.stats.matches += 1;
          
          setCareerState({
              ...careerState,
              player: updatedPlayer,
              matchesHistory: [...careerState.matchesHistory, {
                  matchId: Date.now().toString(),
                  winnerId: matchState.winnerId || 'Draw',
                  scores: {
                    [playerTeam.id]: `${matchState.score[playerTeam.id].runs}/${matchState.score[playerTeam.id].wickets}`,
                    [opponentTeam.id]: `${matchState.score[opponentTeam.id].runs}/${matchState.score[opponentTeam.id].wickets}`
                  },
                  date: new Date().toISOString()
              }]
          });
          setScreen('CAREER');
     } else {
         setScreen('MENU');
     }
  };

  const renderMenu = () => (
    <div className="menu">
      <h1>Cricket Career Sim</h1>
      <button onClick={startCareerSetup}>New Career</button>
      <button onClick={loadCareer}>Load Career</button>
      <button onClick={startMatch}>Quick Match</button>
      <button onClick={() => window.close()}>Exit</button>
    </div>
  );
  
  const renderNewCareer = () => (
      <div className="menu">
          <h2>Create Your Player</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
                type="text" 
                placeholder="Enter Name" 
                value={newPlayerName} 
                onChange={(e) => setNewPlayerName(e.target.value)} 
                style={{ padding: '10px', fontSize: '1rem' }}
            />
            <select 
                value={newPlayerRole} 
                onChange={(e) => setNewPlayerRole(e.target.value as any)}
                style={{ padding: '10px', fontSize: '1rem' }}
            >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
            </select>
          </div>
          <button onClick={createCareer}>Start Career</button>
          <button onClick={() => setScreen('MENU')}>Back</button>
      </div>
  );

  const renderCareer = () => {
      if (!careerState) return <div>Error loading career</div>;
      return (
        <div className="career-dashboard">
            <h2>Career Dashboard</h2>
            <div className="player-stats card">
                <h3>{careerState.player.name}</h3>
                <p>Role: {careerState.player.role}</p>
                <p>Matches: {careerState.player.stats.matches}</p>
                <p>Runs: {careerState.player.stats.runsScored}</p>
                <p>Wickets: {careerState.player.stats.wicketsTaken}</p>
            </div>
            
            <div className="history card">
                <h3>Match History</h3>
                {careerState.matchesHistory.length === 0 ? <p>No matches played.</p> : (
                    <ul>
                        {careerState.matchesHistory.map(m => (
                            <li key={m.matchId}>
                                {m.scores[playerTeam.id]} vs {m.scores[opponentTeam.id]} - Winner: {m.winnerId === playerTeam.id ? 'Won' : 'Lost'}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button onClick={startMatch}>Play Next Match</button>
            <button onClick={saveCareer}>Save Game</button>
            <button onClick={() => setScreen('MENU')}>Main Menu</button>
        </div>
      );
  };

  const renderMatch = () => {
    if (!matchState) return null;
    const battingTeam = matchState.battingTeamId === playerTeam.id ? playerTeam : opponentTeam;
    const score = matchState.score[matchState.battingTeamId];
    const target = matchState.target ? ` | Target: ${matchState.target}` : '';
    
    return (
        <div className="match-screen">
            <div className="scoreboard">
                <h2>{battingTeam.name} Batting</h2>
                <div className="score">{score.runs}/{score.wickets} <span className="overs">({score.overs}.{matchState.currentOver.length})</span></div>
                <div>Innings: {matchState.currentInnings} {target}</div>
            </div>
            <div className="action-area">
                <button className="play-btn" onClick={playBall}>Play Ball</button>
            </div>
            <div className="commentary">
                <h3>Commentary</h3>
                <ul>
                    {commentary.slice(0, 5).map((line, i) => <li key={i}>{line}</li>)}
                </ul>
            </div>
        </div>
    );
  };

  const renderPostMatch = () => (
     <div className="post-match">
         <h2>Match Completed</h2>
         <p>Winner: {matchState?.winnerId ? (matchState.winnerId === playerTeam.id ? playerTeam.name : opponentTeam.name) : 'Draw'}</p>
         <p>Final Scores:</p>
         <p>{playerTeam.name}: {matchState?.score[playerTeam.id].runs}/{matchState?.score[playerTeam.id].wickets}</p>
         <p>{opponentTeam.name}: {matchState?.score[opponentTeam.id].runs}/{matchState?.score[opponentTeam.id].wickets}</p>
         <button onClick={finishMatch}>Continue</button>
     </div>
  );

  return (
    <div className="App">
      {screen === 'MENU' && renderMenu()}
      {screen === 'NEW_CAREER' && renderNewCareer()}
      {screen === 'CAREER' && renderCareer()}
      {screen === 'MATCH' && renderMatch()}
      {screen === 'POST_MATCH' && renderPostMatch()}
    </div>
  )
}

export default App
