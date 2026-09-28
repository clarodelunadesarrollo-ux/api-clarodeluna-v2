import { CheckinCode } from '../../../domain/entities/checkin-code.entity';

export const GET_CURRENT_CHECKIN_CODE_USE_CASE = Symbol(
  'GET_CURRENT_CHECKIN_CODE_USE_CASE',
);

export interface GetCurrentCheckinCodeUseCasePort {
  execute(): Promise<CheckinCode>;
}
