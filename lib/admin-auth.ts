import type { NextApiRequest } from 'next';

/** Server-side gate for admin APIs. Use a real session/RBAC provider before Beta. */
export function requireAdmin(req: NextApiRequest): void {
  const expected = process.env.MASFAH_ADMIN_API_TOKEN;
  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!expected || !provided || provided !== expected) {
    throw new Error('ADMIN_UNAUTHORIZED');
  }
}
