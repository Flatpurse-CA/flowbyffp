const ADMIN_EMAILS = new Set([
  "nnamdikbobi@gmail.com",
]);

export function isAdmin(email: string | undefined): boolean {
  return !!email && ADMIN_EMAILS.has(email);
}
