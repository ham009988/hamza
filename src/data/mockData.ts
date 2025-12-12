import { Player, Team } from '../types';

export const createPlayer = (id: string, name: string, role: Player['role'], batting: number, bowling: number): Player => ({
  id,
  name,
  age: 20 + Math.floor(Math.random() * 15),
  role,
  attributes: {
    batting: { power: batting, timing: batting, defense: batting },
    bowling: { speed: bowling, spin: bowling, accuracy: bowling },
    fielding: { catching: 70, throwing: 70 },
    physical: { stamina: 80, speed: 70 }
  },
  stats: {
    matches: 0,
    runsScored: 0,
    ballsFaced: 0,
    wicketsTaken: 0,
    oversBowled: 0,
    runsConceded: 0,
    catches: 0
  }
});

export const TEAMS: Team[] = [
  {
    id: 'team_a',
    name: 'Thunderbolts',
    players: [
      createPlayer('p1', 'John Smith', 'Batsman', 85, 20),
      createPlayer('p2', 'David Warner', 'Batsman', 90, 10),
      createPlayer('p3', 'Steve Smith', 'Batsman', 92, 40),
      createPlayer('p4', 'Ben Stokes', 'All-Rounder', 80, 80),
      createPlayer('p5', 'Glenn Maxwell', 'All-Rounder', 85, 60),
      createPlayer('p6', 'MS Dhoni', 'Wicket-Keeper', 85, 10),
      createPlayer('p7', 'Pat Cummins', 'Bowler', 40, 90),
      createPlayer('p8', 'Mitchell Starc', 'Bowler', 30, 92),
      createPlayer('p9', 'Nathan Lyon', 'Bowler', 20, 85),
      createPlayer('p10', 'Josh Hazlewood', 'Bowler', 15, 88),
      createPlayer('p11', 'Trent Boult', 'Bowler', 25, 87),
    ]
  },
  {
    id: 'team_b',
    name: 'Hurricanes',
    players: [
      createPlayer('p12', 'Rohit Sharma', 'Batsman', 88, 30),
      createPlayer('p13', 'Virat Kohli', 'Batsman', 95, 20),
      createPlayer('p14', 'Kane Williamson', 'Batsman', 90, 20),
      createPlayer('p15', 'Joe Root', 'Batsman', 89, 50),
      createPlayer('p16', 'Hardik Pandya', 'All-Rounder', 75, 75),
      createPlayer('p17', 'Jos Buttler', 'Wicket-Keeper', 88, 10),
      createPlayer('p18', 'Rashid Khan', 'Bowler', 50, 92),
      createPlayer('p19', 'Jasprit Bumrah', 'Bowler', 20, 95),
      createPlayer('p20', 'Shaheen Afridi', 'Bowler', 30, 89),
      createPlayer('p21', 'Kagiso Rabada', 'Bowler', 25, 90),
      createPlayer('p22', 'Adam Zampa', 'Bowler', 15, 85),
    ]
  }
];
