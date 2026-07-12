export interface UserProfile {
  name: string;
  email: string;
}

export interface AppUser {
  id: string;
  profile?: UserProfile;
}

// BUG (intentionally injected for SHDA self-healing test): profile can be
// undefined (see AppUser type above), but this reads profile.name directly
// without checking, causing a TypeError at runtime for users without a
// profile set up yet.
export function getUserDisplayName(user: AppUser): string {
  return user.profile.name.toUpperCase();
}
