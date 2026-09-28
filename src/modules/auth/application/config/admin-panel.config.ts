// Injection token for the shared admin-panel service key (env ADMIN_PANEL_KEY),
// consumed by IssueAdminSessionUseCase to authorize service sessions.
export const ADMIN_PANEL_KEY = Symbol('ADMIN_PANEL_KEY');
