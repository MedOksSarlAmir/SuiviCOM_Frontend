export type UserRole =
  | "admin"
  | "dg"
  | "dc"
  | "regional"
  | "chef_zone"
  | "superviseur"
  | "vendeur";

export interface User {
  id: string | number;
  username: string;
  email: string;
  role: UserRole;
  last_name?: string;
  first_name?: string;
  wilaya?: string;
  wilaya_id?: number;
  zone?: string;
  zone_id?: number;
  region?: string;
  region_id?: number;
  distributeur_ids?: number[];
  geo_scope?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
