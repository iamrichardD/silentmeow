// backend/src/features/user/repositories/implementations/postgres/types/UserRow.ts

export type UserRow = {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};
