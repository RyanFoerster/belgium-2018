/* Attributes a component does not know about (data-in, data-at, data-t, style, id…) are passed straight to its root element:
   they are what the scroll engine reads. A bare attribute (`data-in`) arrives as `true` and must stay bare, not become "true". */
export function pass(rest: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) out[key] = value === true ? '' : value;
  return out;
}
