export type WDL = 'W' | 'D' | 'L';

export interface PlayerStats {
  goals: number;
  assists: number;
  xg: number;
  passAcc: number;
  duelsWon: number;
  aerialDuels: number;
  distanceCovered: number;
  dribblesPerGame?: number;
  crossingAcc?: number;
  shotsOnTarget?: number;
}

export interface OpponentPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  positionShort: string;
  age: number;
  foot: string;
  x: number;
  y: number;
  stats: PlayerStats;
  strengths: string[];
  playingStyleNotes: string[];
}

export interface UClujPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  positionShort: string;
  age: number;
  foot: string;
  x: number;
  y: number;
  stats: PlayerStats;
  strengths: string[];
}

export interface Opponent {
  id: string;
  name: string;
  country: string;
  formation: string;
  form: WDL[];
  avgPossession: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  avgShotsOnTarget: number;
  pressingIntensity: number;
  setPieceThreat: 'Low' | 'Medium' | 'High' | 'Very High';
  coachNote: string;
  dateAnalyzed: string;
  competition: string;
  matchDate: string;
  players: OpponentPlayer[];
}

export const UCLUJ_PLAYERS: UClujPlayer[] = [
  {
    id: 'ucl-1', name: 'E. Oproiescu', number: 1, position: 'Goalkeeper', positionShort: 'GK',
    age: 28, foot: 'Right', x: 260, y: 700,
    stats: { goals: 0, assists: 0, xg: 0, passAcc: 68, duelsWon: 52, aerialDuels: 65, distanceCovered: 4.8, shotsOnTarget: 0 },
    strengths: ['Distribution', 'Reflexes', 'Command Area'],
  },
  {
    id: 'ucl-2', name: 'L. Houri', number: 2, position: 'Right Back', positionShort: 'RB',
    age: 26, foot: 'Right', x: 410, y: 620,
    stats: { goals: 1, assists: 4, xg: 0.9, passAcc: 81, duelsWon: 60, aerialDuels: 44, distanceCovered: 11.5, crossingAcc: 26, dribblesPerGame: 1.5 },
    strengths: ['Overlapping Runs', 'Defensive Shape', 'Pace'],
  },
  {
    id: 'ucl-3', name: 'A. Buta', number: 3, position: 'Left Back', positionShort: 'LB',
    age: 27, foot: 'Left', x: 110, y: 620,
    stats: { goals: 2, assists: 5, xg: 1.1, passAcc: 83, duelsWon: 63, aerialDuels: 47, distanceCovered: 11.8, crossingAcc: 29, dribblesPerGame: 1.7 },
    strengths: ['Crossing', 'Work Rate', 'Tackling'],
  },
  {
    id: 'ucl-5', name: 'B. Văncean', number: 5, position: 'Centre Back', positionShort: 'CB',
    age: 30, foot: 'Right', x: 315, y: 615,
    stats: { goals: 1, assists: 0, xg: 0.8, passAcc: 87, duelsWon: 65, aerialDuels: 70, distanceCovered: 9.7 },
    strengths: ['Aerial Duels', 'Positioning', 'Leadership'],
  },
  {
    id: 'ucl-6', name: 'M. Leca', number: 6, position: 'Centre Back', positionShort: 'CB',
    age: 29, foot: 'Right', x: 205, y: 615,
    stats: { goals: 0, assists: 1, xg: 0.5, passAcc: 85, duelsWon: 62, aerialDuels: 68, distanceCovered: 9.4 },
    strengths: ['Ball Playing', 'Positioning', 'Tackling'],
  },
  {
    id: 'ucl-8', name: 'N. Sut', number: 8, position: 'Right Midfielder', positionShort: 'RM',
    age: 25, foot: 'Right', x: 400, y: 500,
    stats: { goals: 4, assists: 5, xg: 3.5, passAcc: 78, duelsWon: 57, aerialDuels: 40, distanceCovered: 11.6, dribblesPerGame: 2.0, crossingAcc: 28 },
    strengths: ['High Press', 'Box-to-Box', 'Shooting'],
  },
  {
    id: 'ucl-10', name: 'A. Ioniță', number: 10, position: 'Central Midfielder', positionShort: 'CM',
    age: 29, foot: 'Right', x: 260, y: 495,
    stats: { goals: 6, assists: 8, xg: 5.4, passAcc: 86, duelsWon: 55, aerialDuels: 39, distanceCovered: 10.7, dribblesPerGame: 1.8 },
    strengths: ['Key Passes', 'Long Shots', 'Set Pieces', 'Leadership'],
  },
  {
    id: 'ucl-7', name: 'V. Costache', number: 7, position: 'Left Midfielder', positionShort: 'LM',
    age: 24, foot: 'Left', x: 120, y: 500,
    stats: { goals: 3, assists: 7, xg: 3.2, passAcc: 80, duelsWon: 53, aerialDuels: 37, distanceCovered: 11.3, dribblesPerGame: 2.2, crossingAcc: 27 },
    strengths: ['Dribbling', 'Through Balls', 'Pressing'],
  },
  {
    id: 'ucl-19', name: 'R. Boboc', number: 19, position: 'Right Winger', positionShort: 'RW',
    age: 23, foot: 'Right', x: 390, y: 410,
    stats: { goals: 5, assists: 6, xg: 4.9, passAcc: 73, duelsWon: 50, aerialDuels: 30, distanceCovered: 11.1, dribblesPerGame: 2.7, crossingAcc: 29 },
    strengths: ['Pace', 'Cut Inside', 'Dribbling'],
  },
  {
    id: 'ucl-9', name: 'C. Petrila', number: 9, position: 'Striker', positionShort: 'ST',
    age: 26, foot: 'Right', x: 260, y: 405,
    stats: { goals: 12, assists: 4, xg: 10.8, passAcc: 71, duelsWon: 57, aerialDuels: 63, distanceCovered: 9.3, dribblesPerGame: 1.4, shotsOnTarget: 51 },
    strengths: ['Finishing', 'Hold-Up Play', 'Aerial Duels'],
  },
  {
    id: 'ucl-11', name: 'A. Cordea', number: 11, position: 'Left Winger', positionShort: 'LW',
    age: 25, foot: 'Left', x: 130, y: 410,
    stats: { goals: 7, assists: 9, xg: 5.7, passAcc: 75, duelsWon: 52, aerialDuels: 28, distanceCovered: 11.5, dribblesPerGame: 3.0, crossingAcc: 32 },
    strengths: ['Dribbling', 'Pace', '1v1', 'Crossing'],
  },
];

export const RAPID_PLAYERS: OpponentPlayer[] = [
  {
    id: 'rap-1', name: 'A. Vlad', number: 1, position: 'Goalkeeper', positionShort: 'GK',
    age: 32, foot: 'Right', x: 260, y: 70,
    stats: { goals: 0, assists: 1, xg: 0, passAcc: 71, duelsWon: 58, aerialDuels: 62, distanceCovered: 5.1, shotsOnTarget: 0 },
    strengths: ['Distribution', 'Command Area', 'Reflexes'],
    playingStyleNotes: ['Commands the box aggressively', 'Prefers long kicks to the left flank', 'Rushes off his line quickly in 1v1s'],
  },
  {
    id: 'rap-3', name: 'C. Nică', number: 3, position: 'Left Back', positionShort: 'LB',
    age: 26, foot: 'Left', x: 110, y: 155,
    stats: { goals: 1, assists: 3, xg: 0.8, passAcc: 84, duelsWon: 61, aerialDuels: 45, distanceCovered: 11.2, crossingAcc: 32, dribblesPerGame: 1.4 },
    strengths: ['Overlapping Runs', 'Crossing', 'Work Rate'],
    playingStyleNotes: ['Overlaps frequently on the left channel', 'Combines well with Lazăr in triangles', 'Cuts inside when space opens in midfield'],
  },
  {
    id: 'rap-4', name: 'B. Antonescu', number: 4, position: 'Centre Back', positionShort: 'CB',
    age: 31, foot: 'Right', x: 205, y: 160,
    stats: { goals: 2, assists: 0, xg: 1.2, passAcc: 88, duelsWon: 67, aerialDuels: 71, distanceCovered: 9.8 },
    strengths: ['Aerial Duels', 'Positioning', 'Set Pieces'],
    playingStyleNotes: ['Dominant in aerial duels at set pieces', 'Plays long diagonal balls to switch play', 'Reads danger early, rarely overcommits'],
  },
  {
    id: 'rap-5', name: 'Ș. Grozavu', number: 5, position: 'Centre Back', positionShort: 'CB',
    age: 29, foot: 'Right', x: 315, y: 160,
    stats: { goals: 0, assists: 1, xg: 0.4, passAcc: 86, duelsWon: 64, aerialDuels: 68, distanceCovered: 9.5 },
    strengths: ['Ball Playing', 'Positioning', 'Tackling'],
    playingStyleNotes: ['Builds out from the back calmly', 'Switches play through short combinations', 'Vulnerable when pressed high — slow on the turn'],
  },
  {
    id: 'rap-22', name: 'M. Iordache', number: 22, position: 'Right Back', positionShort: 'RB',
    age: 27, foot: 'Right', x: 410, y: 155,
    stats: { goals: 2, assists: 5, xg: 1.5, passAcc: 82, duelsWon: 63, aerialDuels: 42, distanceCovered: 11.8, crossingAcc: 28, dribblesPerGame: 1.8 },
    strengths: ['Attacking Width', 'Crossing', 'Through Balls'],
    playingStyleNotes: ['Attacks the right channel aggressively', 'Often found inside the box late in attacks', 'Likes through-balls in behind the defensive line'],
  },
  {
    id: 'rap-7', name: 'C. Lazăr', number: 7, position: 'Left Midfielder', positionShort: 'LM',
    age: 25, foot: 'Left', x: 120, y: 270,
    stats: { goals: 4, assists: 6, xg: 3.8, passAcc: 79, duelsWon: 55, aerialDuels: 38, distanceCovered: 11.4, dribblesPerGame: 2.4 },
    strengths: ['Dribbling', 'Through Balls', 'Pressing'],
    playingStyleNotes: ['Cuts inside from the left with his right foot', 'Quick one-twos in tight spaces near the box', 'Threatens with long shots after cutting in'],
  },
  {
    id: 'rap-10', name: 'F. Tănase', number: 10, position: 'Central Midfielder', positionShort: 'CM',
    age: 29, foot: 'Right', x: 260, y: 275,
    stats: { goals: 8, assists: 9, xg: 6.2, passAcc: 87, duelsWon: 58, aerialDuels: 41, distanceCovered: 10.9, dribblesPerGame: 2.1 },
    strengths: ['Key Passes', 'Long Shots', 'Set Pieces', 'Leadership'],
    playingStyleNotes: ['Key link between midfield and attack — must be pressed high', 'Dictates tempo from deep positions', 'Primary set-piece taker, bends ball to the near post', 'Drifts wide to create overloads'],
  },
  {
    id: 'rap-8', name: 'A. Pintea', number: 8, position: 'Right Midfielder', positionShort: 'RM',
    age: 28, foot: 'Right', x: 400, y: 270,
    stats: { goals: 5, assists: 4, xg: 4.4, passAcc: 78, duelsWon: 62, aerialDuels: 44, distanceCovered: 11.9, dribblesPerGame: 1.9, crossingAcc: 30 },
    strengths: ['High Press', 'Box-to-Box', 'Shooting'],
    playingStyleNotes: ['Box-to-box runner, arrives late into the penalty area', 'Press trigger — presses immediately after losing the ball', 'Shoots on sight from outside the box'],
  },
  {
    id: 'rap-19', name: 'I. Petrescu', number: 19, position: 'Left Winger', positionShort: 'LW',
    age: 23, foot: 'Left', x: 130, y: 355,
    stats: { goals: 6, assists: 7, xg: 5.1, passAcc: 74, duelsWon: 51, aerialDuels: 29, distanceCovered: 11.2, dribblesPerGame: 3.2, crossingAcc: 27 },
    strengths: ['Dribbling', 'Pace', '1v1', 'High Press'],
    playingStyleNotes: ['Drives at full-backs with sudden acceleration', 'Sharp change of direction to get to the byline', 'Delivers low crosses from wide left', 'Presses defenders intensely to force errors'],
  },
  {
    id: 'rap-9', name: 'V. Gheorghe', number: 9, position: 'Striker', positionShort: 'ST',
    age: 27, foot: 'Right', x: 260, y: 360,
    stats: { goals: 14, assists: 3, xg: 12.4, passAcc: 69, duelsWon: 59, aerialDuels: 67, distanceCovered: 9.6, dribblesPerGame: 1.2, shotsOnTarget: 54 },
    strengths: ['Aerial Duels', 'Finishing', 'Hold-Up Play', 'Set Pieces'],
    playingStyleNotes: ['Drops deep to receive and bring others into play', 'Major aerial threat at corners and free kicks', 'Hold-up play to bring midfielders in behind', 'Runs in behind when the back line pushes up'],
  },
  {
    id: 'rap-11', name: 'G. Enache', number: 11, position: 'Right Winger', positionShort: 'RW',
    age: 24, foot: 'Right', x: 390, y: 355,
    stats: { goals: 7, assists: 8, xg: 5.8, passAcc: 72, duelsWon: 53, aerialDuels: 31, distanceCovered: 11.6, dribblesPerGame: 2.9, crossingAcc: 31 },
    strengths: ['Pace', 'Cut Inside', 'Crossing', 'Dribbling'],
    playingStyleNotes: ['Cuts inside from the right to shoot with his left foot', 'Likes to play quick one-twos before entering the box', 'Low cross from the right channel after beating his man', 'Threatens the near post when cutting in'],
  },
];

export const NEXT_MATCH: Opponent = {
  id: 'rapid',
  name: 'Rapid București',
  country: 'Romania',
  formation: '4-3-3',
  form: ['W', 'D', 'W', 'L', 'W'],
  avgPossession: 52,
  avgGoalsScored: 1.8,
  avgGoalsConceded: 1.2,
  avgShotsOnTarget: 4.6,
  pressingIntensity: 67,
  setPieceThreat: 'High',
  coachNote: 'Tănase (#10) is the key link between midfield and attack — must be pressed high. Their right back Iordache pushes aggressively. Watch the left channel when Nică and Lazăr combine. Set pieces conceded: 4 in last 5 — exploit corners early.',
  dateAnalyzed: 'Apr 25, 2026',
  competition: 'SuperLiga România',
  matchDate: 'Mon, 28 Apr 2026 · 20:00',
  players: RAPID_PLAYERS,
};

export interface RecentAnalysis {
  id: string;
  opponentName: string;
  country: string;
  formation: string;
  dateAnalyzed: string;
  form: WDL[];
}

export const RECENT_ANALYSES: RecentAnalysis[] = [
  { id: 'cfr', opponentName: 'CFR Cluj', country: 'Romania', formation: '4-2-3-1', dateAnalyzed: 'Apr 14, 2026', form: ['W', 'W', 'D', 'W', 'L'] },
  { id: 'fcsb', opponentName: 'FCSB', country: 'Romania', formation: '4-4-2', dateAnalyzed: 'Apr 7, 2026', form: ['L', 'W', 'W', 'D', 'W'] },
  { id: 'farul', opponentName: 'Farul Constanța', country: 'Romania', formation: '3-4-3', dateAnalyzed: 'Mar 31, 2026', form: ['W', 'D', 'L', 'W', 'D'] },
  { id: 'petrolul', opponentName: 'Petrolul Ploiești', country: 'Romania', formation: '4-3-3', dateAnalyzed: 'Mar 24, 2026', form: ['W', 'W', 'W', 'D', 'L'] },
  { id: 'sepsi', opponentName: 'Sepsi OSK', country: 'Romania', formation: '4-5-1', dateAnalyzed: 'Mar 17, 2026', form: ['D', 'L', 'W', 'W', 'L'] },
  { id: 'dinamo', opponentName: 'Dinamo București', country: 'Romania', formation: '4-3-3', dateAnalyzed: 'Mar 10, 2026', form: ['W', 'W', 'D', 'L', 'W'] },
];