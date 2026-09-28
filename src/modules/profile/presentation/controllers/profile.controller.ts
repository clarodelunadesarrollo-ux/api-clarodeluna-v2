import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import {
    GET_PROFILE_USE_CASE,
    GetProfileUseCasePort,
} from '../../application/ports/in/get-profile.port';
import {
    UPDATE_PROFILE_USE_CASE,
    UpdateProfileUseCasePort,
} from '../../application/ports/in/update-profile.port';
import { ProfileResponseDto } from '../dtos/profile-response.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    @Inject(GET_PROFILE_USE_CASE)
    private readonly getProfile: GetProfileUseCasePort,
    @Inject(UPDATE_PROFILE_USE_CASE)
    private readonly updateProfile: UpdateProfileUseCasePort,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProfileResponseDto> {
    const view = await this.getProfile.execute(user.userId);
    return new ProfileResponseDto(view);
  }

  @Patch()
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const view = await this.updateProfile.execute(user.userId, dto.name ?? null);
    return new ProfileResponseDto(view);
  }
}
