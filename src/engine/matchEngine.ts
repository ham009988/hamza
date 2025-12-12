import { Player, Ball } from '../types';

export const simulateBall = (batsman: Player, bowler: Player): Ball => {
  // Simplified logic
  const batsmanSkill = (batsman.attributes.batting.power + batsman.attributes.batting.timing) / 2;
  const bowlerSkill = (bowler.attributes.bowling.speed + bowler.attributes.bowling.accuracy + bowler.attributes.bowling.spin) / 3;

  const diff = batsmanSkill - bowlerSkill;
  // randomFactor 0-100
  const randomFactor = Math.random() * 100;

  let runs = 0;
  let isWicket = false;
  let description = "";
  let wicketType: 'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | undefined = undefined;

  // Base probabilities
  // Wicket: 5%
  // Dot: 35%
  // Runs: 60%
  
  // Adjust based on skill difference (diff is approx -50 to +50)
  // If batsman is better (diff > 0), wicket chance decreases, run chance increases.
  
  const wicketThreshold = 5 - (diff / 10); // e.g. if diff is 20, wicket threshold is 3%
  const dotThreshold = 40 - (diff / 5);   // e.g. if diff is 20, dot threshold is 36%

  if (randomFactor < Math.max(1, wicketThreshold)) {
    isWicket = true;
    const wTypeRand = Math.random();
    if (wTypeRand < 0.3) { wicketType = 'Bowled'; description = "Clean bowled!"; }
    else if (wTypeRand < 0.8) { wicketType = 'Caught'; description = "Caught out!"; }
    else { wicketType = 'LBW'; description = "LBW!"; }
  } else if (randomFactor < Math.max(wicketThreshold + 1, dotThreshold)) {
    runs = 0;
    description = "Dot ball.";
  } else {
    // Runs distribution based on Power
    const powerFactor = batsman.attributes.batting.power / 100;
    const runRandom = Math.random();
    
    if (runRandom < 0.4 - (powerFactor * 0.1)) runs = 1;
    else if (runRandom < 0.6 - (powerFactor * 0.1)) runs = 2;
    else if (runRandom < 0.7) runs = 3;
    else if (runRandom < 0.9 - (powerFactor * 0.2)) runs = 4;
    else runs = 6;
    
    description = `${runs} runs off the bat.`;
  }

  return {
    bowlerId: bowler.id,
    batsmanId: batsman.id,
    runs,
    isWicket,
    isWide: false,
    isNoBall: false,
    description,
    wicketType
  };
};
