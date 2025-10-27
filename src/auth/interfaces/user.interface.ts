export type AuthProvider = 'local' | 'google';

export interface User {
  id: bigint;
  email: string;
  full_name: string;
  password_hash?: string;
  google_sub?: string;
  provider: AuthProvider;
  created_at: Date;
  updated_at: Date;
}

