// Quotes a user-supplied value for use inside a PostgREST `.or()` filter
// string. Unquoted, a comma or parenthesis in the value starts a new filter
// clause (e.g. a phone of "x,id.neq.0" matches every row), which is the
// PostgREST equivalent of SQL string concatenation. Double-quoting with
// backslash-escaped quotes/backslashes makes PostgREST treat it as one literal.
export function pgrstQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
