/* The twenty-three players Belgium registered for the 2018 World Cup, by shirt number, with their club at the time.
   `photo` is a key of data/photos.ts; a player without one gets a number sticker instead. */
import type { PhotoKey } from './photos';

export interface Player {
  no: number;
  /** as printed on the sticker */
  name: string;
  club: string;
  photo?: PhotoKey;
  /** where the portrait is centred in its frame (object-position) */
  focus?: string;
  captain?: boolean;
  /** as on FIFA's squad list */
  pos: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  /** figures of his World Cup, as "big|small" pairs — only the ones this page states elsewhere */
  facts?: [string, string][];
  /** what he is remembered for in these seven matches */
  note?: string;
}

export const SQUAD: Player[] = [
  { no: 1, name: 'Courtois', club: 'Chelsea', photo: 'courtois', pos: 'Goalkeeper', facts: [['27', 'saves']], note: 'Golden Glove' },
  { no: 2, name: 'Alderweireld', club: 'Tottenham', photo: 'alderweireld', pos: 'Defender' },
  { no: 3, name: 'Vermaelen', club: 'Barcelona', photo: 'vermaelen', focus: '50% 22%', pos: 'Defender' },
  { no: 4, name: 'Kompany', club: 'Manchester City', photo: 'kompany', pos: 'Defender' },
  { no: 5, name: 'Vertonghen', club: 'Tottenham', photo: 'vertonghen', focus: '62% 30%', pos: 'Defender', facts: [['1', 'goal']], note: 'the header against Japan, 69′' },
  { no: 6, name: 'Witsel', club: 'Tianjin Quanjian', photo: 'witsel', pos: 'Midfielder' },
  { no: 7, name: 'De Bruyne', club: 'Manchester City', photo: 'kdb', pos: 'Midfielder', facts: [['1', 'goal']], note: 'Kazan, 31′' },
  { no: 8, name: 'Fellaini', club: 'Manchester United', photo: 'fellaini', pos: 'Midfielder', facts: [['1', 'goal']], note: 'level against Japan, 74′' },
  { no: 9, name: 'R. Lukaku', club: 'Manchester United', photo: 'lukaku', pos: 'Forward', facts: [['4', 'goals'], ['1', 'assist']], note: 'Bronze Boot' },
  { no: 10, name: 'E. Hazard', club: 'Chelsea', photo: 'hazard', captain: true, pos: 'Forward', facts: [['3', 'goals'], ['2', 'assists']], note: 'captain · Silver Ball' },
  { no: 11, name: 'Carrasco', club: 'Dalian Yifang', photo: 'carrasco', focus: '50% 18%', pos: 'Midfielder' },
  { no: 12, name: 'Mignolet', club: 'Liverpool', photo: 'mignolet', focus: '50% 20%', pos: 'Goalkeeper' },
  { no: 13, name: 'Casteels', club: 'Wolfsburg', pos: 'Goalkeeper' },
  { no: 14, name: 'Mertens', club: 'Napoli', photo: 'mertens', pos: 'Forward', facts: [['1', 'goal']], note: 'the volley against Panama, 47′' },
  { no: 15, name: 'Meunier', club: 'Paris Saint-Germain', photo: 'meunier', pos: 'Defender', facts: [['1', 'goal']], note: 'the tenth scorer, 4′ against England' },
  { no: 16, name: 'T. Hazard', club: 'Mönchengladbach', photo: 'thazard', focus: '50% 30%', pos: 'Midfielder' },
  { no: 17, name: 'Tielemans', club: 'Monaco', photo: 'tielemans', focus: '50% 12%', pos: 'Midfielder' },
  { no: 18, name: 'Januzaj', club: 'Real Sociedad', photo: 'januzajP', focus: '50% 25%', pos: 'Midfielder', facts: [['1', 'goal']], note: 'the winner against England, 51′' },
  { no: 19, name: 'Dembélé', club: 'Tottenham', photo: 'dembele', focus: '50% 25%', pos: 'Midfielder' },
  { no: 20, name: 'Boyata', club: 'Celtic', photo: 'boyata', focus: '50% 14%', pos: 'Defender' },
  { no: 21, name: 'Batshuayi', club: 'Chelsea', photo: 'batshuayi', focus: '50% 12%', pos: 'Forward', facts: [['1', 'goal']], note: '90′ against Tunisia' },
  { no: 22, name: 'Chadli', club: 'West Bromwich Albion', photo: 'chadli', pos: 'Midfielder', facts: [['1', 'goal']], note: '90+4′ against Japan' },
  { no: 23, name: 'Dendoncker', club: 'Anderlecht', photo: 'dendoncker', focus: '50% 25%', pos: 'Midfielder' },
];

/* The three individual awards Belgian players took home from Russia, with the figures behind them. */
export interface Award {
  key: string;
  /** the trophy, in two words: the first is set huge, the second in script across it */
  metal: string;
  object: string;
  player: string;
  no: number;
  photo: PhotoKey;
  /** what FIFA gives it for */
  what: string;
  /** the figures, as "big|small" pairs */
  facts: [string, string][];
}

export const AWARDS: Award[] = [
  { key: 'ball', metal: 'Silver', object: 'Ball', player: 'Eden Hazard', no: 10, photo: 'hazard', what: 'Second-best player of the tournament', facts: [['3', 'goals'], ['2', 'assists']] },
  { key: 'glove', metal: 'Golden', object: 'Glove', player: 'Thibaut Courtois', no: 1, photo: 'courtois', what: 'Best goalkeeper of the tournament', facts: [['27', 'saves'], ['N°1', 'of any keeper']] },
  { key: 'boot', metal: 'Bronze', object: 'Boot', player: 'Romelu Lukaku', no: 9, photo: 'lukaku', what: 'Third-highest scorer of the tournament', facts: [['4', 'goals'], ['1', 'assist']] },
];
