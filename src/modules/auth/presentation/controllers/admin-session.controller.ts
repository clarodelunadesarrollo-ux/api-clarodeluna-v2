import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from '@nestjs/common';

import { Public } from '../../../../common/decorators/public.decorator';
import {
    ISSUE_ADMIN_SESSION_USE_CASE,
    IssueAdminSessionPort,
} from '../../application/ports/in/issue-admin-session.port';
import { AdminSessionDto } from '../dtos/admin-session.dto';
import { ValidateOtpResponseDto } from '../dtos/validate-otp-response.dto';

@Controller('auth/admin')
export class AdminSessionController {
  constructor(
    @Inject(ISSUE_ADMIN_SESSION_USE_CASE)
    private readonly issueAdminSession: IssueAdminSessionPort,
  ) {}

  @Public()
  @Post('session')
  @HttpCode(HttpStatus.OK)
  async session(@Body() dto: AdminSessionDto): Promise<ValidateOtpResponseDto> {
    const tokens = await this.issueAdminSession.execute(dto.panelKey);
    return new ValidateOtpResponseDto(tokens);
  }
}
