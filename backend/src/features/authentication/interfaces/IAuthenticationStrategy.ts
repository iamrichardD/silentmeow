import { AuthCredentials } from '@auth/interfaces/AuthCredentials.js';
import { UserIdentity } from '@auth/interfaces/UserIdentity.js';

export interface IAuthenticationStrategy {
  validate(credentials: AuthCredentials): Promise<UserIdentity>;
}
