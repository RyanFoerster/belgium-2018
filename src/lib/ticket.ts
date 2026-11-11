import { MATCHES } from '../data/matches';

/* One ticket template, seven matches: the facts printed on it are the ones in data/matches.ts.
   Used by the <Ticket> component at build time and by the wall in the browser. */
export function ticketHTML(no: number | string, stamped = false): string {
  const m = MATCHES[+no];
  if (!m) return '';
  return (
    '<div class="tkt-a"><span class="mono">World Cup · Russia 2018 · ' + m.round + '</span><b class="d">' + m.teams + '</b><span class="mono">' + m.venue + '</span><i class="tkt-bar"></i>' +
    '<span class="mono tkt-ser">№ ' + ('00' + m.no).slice(-3) + ' / 064 · keep this stub</span></div>' +
    '<div class="tkt-b"><span class="mono">Match</span><b class="d">' + m.no + '</b><span class="mono">' + m.date + '</span></div>' +
    (stamped ? '<span class="stamp tkt-st">' + m.score + '<small>full time</small></span>' : '')
  );
}
