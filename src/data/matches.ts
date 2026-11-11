/* Belgium's seven matches at the 2018 World Cup, as printed on the tickets.
   Match numbers are FIFA's own (out of 64). */
export interface Match {
  no: number;
  teams: string;
  round: string;
  venue: string;
  date: string;
  /** full-time score, in the order the teams are printed */
  score: string;
  /** the goals, in order: [scorer, minute, 1 if it counted for the opponent] — printed on the back of the ticket */
  goals: [string, string, number?][];
}

export const MATCHES: Record<number, Match> = {
  13: { no: 13, teams: 'BEL—PAN', round: 'Group G', venue: 'Fisht Stadium, Sochi', date: '18.06.18', score: '3—0', goals: [['Mertens', '47′'], ['Lukaku', '69′'], ['Lukaku', '75′']] },
  29: { no: 29, teams: 'BEL—TUN', round: 'Group G', venue: 'Spartak Stadium, Moscow', date: '23.06.18', score: '5—2', goals: [['E. Hazard', '6′ pen.'], ['Lukaku', '16′'], ['Bronn', '18′', 1], ['Lukaku', '45+3′'], ['E. Hazard', '51′'], ['Batshuayi', '90′'], ['Khazri', '90+3′', 1]] },
  45: { no: 45, teams: 'ENG—BEL', round: 'Group G', venue: 'Kaliningrad Stadium', date: '28.06.18', score: '0—1', goals: [['Januzaj', '51′']] },
  54: { no: 54, teams: 'BEL—JPN', round: 'Round of 16', venue: 'Rostov Arena', date: '02.07.18', score: '3—2', goals: [['Haraguchi', '48′', 1], ['Inui', '52′', 1], ['Vertonghen', '69′'], ['Fellaini', '74′'], ['Chadli', '90+4′']] },
  58: { no: 58, teams: 'BRA—BEL', round: 'Quarter-final', venue: 'Kazan Arena', date: '06.07.18', score: '1—2', goals: [['Fernandinho o.g.', '13′'], ['De Bruyne', '31′'], ['Renato Augusto', '76′', 1]] },
  61: { no: 61, teams: 'FRA—BEL', round: 'Semi-final', venue: 'Saint Petersburg Stadium', date: '10.07.18', score: '1—0', goals: [['Umtiti', '51′', 1]] },
  63: { no: 63, teams: 'BEL—ENG', round: 'Third-place play-off', venue: 'Saint Petersburg Stadium', date: '14.07.18', score: '2—0', goals: [['Meunier', '4′'], ['E. Hazard', '82′']] },
};

export type MatchNo = 13 | 29 | 45 | 54 | 58 | 61 | 63;
