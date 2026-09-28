import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    UPDATE_VR_EXPERIENCE_USE_CASE,
    UpdateVrExperienceUseCasePort,
} from '../../application/ports/in/update-vr-experience.port';
import {
    UPLOAD_VR_VIDEO_USE_CASE,
    UploadVrVideoUseCasePort,
} from '../../application/ports/in/upload-vr-video.port';
import { InvalidVrExperienceException } from '../../domain/exceptions/invalid-vr-experience.exception';
import { UpdateVrExperienceDto } from '../dtos/update-vr-experience.dto';
import { UploadVrVideoResponseDto } from '../dtos/upload-vr-video-response.dto';
import { VrExperienceResponseDto } from '../dtos/vr-experience-response.dto';

// Admin surface for the VR experience. Protected by the global JwtAuthGuard AND
// role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('vr/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class VrAdminController {
  constructor(
    @Inject(UPDATE_VR_EXPERIENCE_USE_CASE)
    private readonly updateExperience: UpdateVrExperienceUseCasePort,
    @Inject(UPLOAD_VR_VIDEO_USE_CASE)
    private readonly uploadVideo: UploadVrVideoUseCasePort,
  ) {}

  @Put('experience')
  async update(
    @Body() dto: UpdateVrExperienceDto,
  ): Promise<VrExperienceResponseDto> {
    const experience = await this.updateExperience.execute(dto);
    return new VrExperienceResponseDto(experience);
  }

  @Post('experience/video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideoFile(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UploadVrVideoResponseDto> {
    if (!file) {
      throw new InvalidVrExperienceException(
        'video file is required',
        'Adjuntá un video.',
      );
    }
    const result = await this.uploadVideo.execute({
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
    return new UploadVrVideoResponseDto(result.videoUrl);
  }
}
