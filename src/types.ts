export interface PlayerAttributes {
  batting: {
    power: number;
    timing: number;
    defense: number;
  };
  bowling: {
    speed: number;
    spin: number;
    accuracy: number;
  };
  fielding: {
    catching: number;
    throwing: number;
  };
  physical: {
    stamina: number;
    speed: number;
  };
}

export interface Player {
  id: string;
  name: string;
  age: number;
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
  attributes: PlayerAttributes;
  stats: PlayerStats;
}

export interface PlayerStats {
  matches: number;
  runsScored: number;
  ballsFaced: number;
  wicketsTaken: number;
  oversBowled: number;
  runsConceded: number;
  catches: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface MatchState {
  battingTeamId: string;
  bowlingTeamId: string;
  currentInnings: 1 | 2;
  score: {
    [teamId: string]: {
      runs: number;
      wickets: number;
      overs: number;
    };
  };
  currentOver: Ball[];
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  target?: number;
  isCompleted: boolean;
  winnerId?: string;
}

export interface Ball {
  bowlerId: string;
  batsmanId: string;
  runs: number;
  isWicket: boolean;
  isWide: boolean;
  isNoBall: boolean;
  description: string;
  wicketType?: 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped';
}

export interface GameState {
  player: Player;
  currentTeamId: string;
  teams: Team[];
  date: string; // ISO Date
  matchesHistory: MatchResult[];
}

export interface MatchResult {
  matchId: string;
  winnerId: string;
  scores: { [teamId: string]: string }; // e.g., "150/4 (20.0)"
  date: string;
}
