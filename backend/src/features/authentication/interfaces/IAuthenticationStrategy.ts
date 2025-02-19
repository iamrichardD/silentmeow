import { AuthCredentials } from './AuthCredentials';
import { UserIdentity } from './UserIdentity';

export interface IAuthenticationStrategy {
  validate(credentials: AuthCredentials): Promise<UserIdentity>;
}
