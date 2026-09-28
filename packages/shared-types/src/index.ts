/**
 * Codentra shared types.
 *
 * These types are consumed by both apps/frontend and apps/backend so
 * request/response shapes never drift between the two. Populated
 * incrementally as each domain module is built (auth, projects, scans, etc).
 */

export type UserRole = 'owner' | 'admin' | 'member';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}
