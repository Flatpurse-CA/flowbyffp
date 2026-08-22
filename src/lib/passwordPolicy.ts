// Shared minimum bar for any password this app sets directly (signup, staff
// invite, password reset). Deliberately light-touch — length + a letter and a
// number — not full strength scoring; Supabase Auth is the source of truth
// for the account, this just stops the weakest passwords at the door.
export function validatePassword(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters";
  if (!/[a-zA-Z]/.test(password)) return "Password must include at least one letter";
  if (!/[0-9]/.test(password)) return "Password must include at least one number";
  return null;
}
