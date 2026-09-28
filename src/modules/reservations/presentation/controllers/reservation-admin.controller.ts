import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseEnumPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    ADMIN_DELETE_RESERVATION_USE_CASE,
    AdminDeleteReservationUseCasePort,
} from '../../application/ports/in/admin-delete-reservation.port';
import {
    ADMIN_LIST_RESERVATIONS_USE_CASE,
    AdminListReservationsUseCasePort,
} from '../../application/ports/in/admin-list-reservations.port';
import {
    ADMIN_UPDATE_RESERVATION_USE_CASE,
    AdminUpdateReservationUseCasePort,
} from '../../application/ports/in/admin-update-reservation.port';
import {
    CREATE_RESERVATION_BLACKOUT_USE_CASE,
    CreateReservationBlackoutUseCasePort,
} from '../../application/ports/in/create-reservation-blackout.port';
import {
    DELETE_RESERVATION_BLACKOUT_USE_CASE,
    DeleteReservationBlackoutUseCasePort,
} from '../../application/ports/in/delete-reservation-blackout.port';
import {
    GET_RESERVATION_SCHEDULES_USE_CASE,
    GetReservationSchedulesUseCasePort,
} from '../../application/ports/in/get-reservation-schedules.port';
import {
    LIST_RESERVATION_BLACKOUTS_USE_CASE,
    ListReservationBlackoutsUseCasePort,
} from '../../application/ports/in/list-reservation-blackouts.port';
import {
    UPDATE_RESERVATION_SCHEDULE_USE_CASE,
    UpdateReservationScheduleUseCasePort,
} from '../../application/ports/in/update-reservation-schedule.port';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { AdminUpdateReservationDto } from '../dtos/admin-update-reservation.dto';
import { BlackoutResponseDto } from '../dtos/blackout-response.dto';
import { CreateBlackoutDto } from '../dtos/create-blackout.dto';
import { ListReservationsQueryDto } from '../dtos/list-reservations-query.dto';
import { ReservationResponseDto } from '../dtos/reservation-response.dto';
import { ScheduleResponseDto } from '../dtos/schedule-response.dto';
import { UpdateScheduleDto } from '../dtos/update-schedule.dto';

// Admin surface for reservation scheduling. Protected by the global
// JwtAuthGuard AND role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('reservations/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class ReservationAdminController {
  constructor(
    @Inject(GET_RESERVATION_SCHEDULES_USE_CASE)
    private readonly getSchedules: GetReservationSchedulesUseCasePort,
    @Inject(UPDATE_RESERVATION_SCHEDULE_USE_CASE)
    private readonly updateSchedule: UpdateReservationScheduleUseCasePort,
    @Inject(LIST_RESERVATION_BLACKOUTS_USE_CASE)
    private readonly listBlackouts: ListReservationBlackoutsUseCasePort,
    @Inject(CREATE_RESERVATION_BLACKOUT_USE_CASE)
    private readonly createBlackout: CreateReservationBlackoutUseCasePort,
    @Inject(DELETE_RESERVATION_BLACKOUT_USE_CASE)
    private readonly deleteBlackout: DeleteReservationBlackoutUseCasePort,
    @Inject(ADMIN_LIST_RESERVATIONS_USE_CASE)
    private readonly listReservations: AdminListReservationsUseCasePort,
    @Inject(ADMIN_UPDATE_RESERVATION_USE_CASE)
    private readonly updateReservation: AdminUpdateReservationUseCasePort,
    @Inject(ADMIN_DELETE_RESERVATION_USE_CASE)
    private readonly deleteReservation: AdminDeleteReservationUseCasePort,
  ) {}

  @Get('schedules')
  async schedules(): Promise<ScheduleResponseDto[]> {
    const schedules = await this.getSchedules.execute();
    return schedules.map((schedule) => new ScheduleResponseDto(schedule));
  }

  @Put('schedules/:type')
  async updateScheduleByType(
    @Param('type', new ParseEnumPipe(ReservationType)) type: ReservationType,
    @Body() dto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.updateSchedule.execute({
      type,
      openTime: dto.openTime,
      closeTime: dto.closeTime,
      intervalMinutes: dto.intervalMinutes,
      active: dto.active,
    });
    return new ScheduleResponseDto(schedule);
  }

  @Get('blackouts')
  async blackouts(): Promise<BlackoutResponseDto[]> {
    const blackouts = await this.listBlackouts.execute();
    return blackouts.map((blackout) => new BlackoutResponseDto(blackout));
  }

  @Post('blackouts')
  @HttpCode(HttpStatus.CREATED)
  async addBlackout(
    @Body() dto: CreateBlackoutDto,
  ): Promise<BlackoutResponseDto> {
    const blackout = await this.createBlackout.execute({
      date: dto.date,
      scope: dto.scope,
      reason: dto.reason,
    });
    return new BlackoutResponseDto(blackout);
  }

  @Delete('blackouts/:id')
  @HttpCode(HttpStatus.OK)
  async removeBlackout(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string }> {
    await this.deleteBlackout.execute(id);
    return { id };
  }

  @Get('reservations')
  async reservations(
    @Query() query: ListReservationsQueryDto,
  ): Promise<ReservationResponseDto[]> {
    const reservations = await this.listReservations.execute({
      type: query.type,
      status: query.status,
    });
    return reservations.map(
      (reservation) => new ReservationResponseDto(reservation),
    );
  }

  @Patch('reservations/:id')
  async updateReservationById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateReservationDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.updateReservation.execute({
      reservationId: id,
      date: dto.date,
      time: dto.time,
      partySize: dto.partySize,
      status: dto.status,
    });
    return new ReservationResponseDto(reservation);
  }

  @Delete('reservations/:id')
  @HttpCode(HttpStatus.OK)
  async removeReservation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string }> {
    await this.deleteReservation.execute(id);
    return { id };
  }
}
