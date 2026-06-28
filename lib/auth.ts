// Extremely lightweight admin gate. This is NOT real security — it just stops
// friends from casually opening the admin page. The password is compared
// against the ADMIN_PASSWORD env var. The client sends it in the
// `x-admin-password` header (or a `password` field in the JSON body).

export function isAdmin(provided: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // no password configured -> admin locked out
  return !!provided && provided === expected;
}

export function adminFromRequest(req: Request, bodyPassword?: string): boolean {
  const header = req.headers.get("x-admin-password");
  return isAdmin(header ?? bodyPassword);
}
