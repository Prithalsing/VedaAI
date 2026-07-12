export interface UserProfile {
  name: string;
  email: string;
}

export interface AppUser {
  id: string;
  profile?: UserProfile;
}

// Fixed: safely handle undefined profile
export function getUserDisplayName(user: AppUser): string {
  return user.profile?.name ? user.profile.name.toUpperCase() : '';
}
