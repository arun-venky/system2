import { Permission, Role } from "../role";

export interface User {
  twoFactorEnabled: any;
  roles: Role[];
  permissions: Permission[];
  _id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
} 