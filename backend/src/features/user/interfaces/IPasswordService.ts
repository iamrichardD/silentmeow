// backend/src/features/authentication/interfaces/IPasswordService.ts
export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
