import { TokenPair } from '../out/token-generator.port';

export const ISSUE_ADMIN_SESSION_USE_CASE = Symbol(
  'ISSUE_ADMIN_SESSION_USE_CASE',
);

export interface IssueAdminSessionPort {
  execute(panelKey: string): Promise<TokenPair>;
}
