import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import {
    CANCEL_RESERVATION_USE_CASE,
    CancelReservationUseCasePort,
} from '../../application/ports/in/cancel-reservation.port';
import {
    CREATE_RESERVATION_USE_CASE,
    CreateReservationUseCasePort,
} from '../../application/ports/in/create-reservation.port';
import {
    GET_RESERVATION_SLOTS_USE_CASE,
    GetReservationSlotsUseCasePort,
} from '../../application/ports/in/get-reservation-slots.port';
import {
    GET_RESTAURANT_HOURS_USE_CASE,
    GetRestaurantHoursUseCasePort,
} from '../../application/ports/in/get-restaurant-hours.port';
import {
    LIST_RESERVATIONS_USE_CASE,
    ListReservationsUseCasePort,
} from '../../application/ports/in/list-reservations.port';
import {
    UPDATE_RESERVATION_USE_CASE,
    UpdateReservationUseCasePort,
} from '../../application/ports/in/update-reservation.port';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { ReservationResponseDto } from '../dtos/reservation-response.dto';
import { RestaurantHoursResponseDto } from '../dtos/restaurant-hours-response.dto';
import { SlotsResponseDto } from '../dtos/slots-response.dto';
import { UpdateReservationDto } from '../dtos/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(
    @Inject(CREATE_RESERVATION_USE_CASE)
    private readonly createReservation: CreateReservationUseCasePort,
    @Inject(LIST_RESERVATIONS_USE_CASE)
    private readonly listReservations: ListReservationsUseCasePort,
    @Inject(UPDATE_RESERVATION_USE_CASE)
    private readonly updateReservation: UpdateReservationUseCasePort,
    @Inject(CANCEL_RESERVATION_USE_CASE)
    private readonly cancelReservation: CancelReservationUseCasePort,
    @Inject(GET_RESERVATION_SLOTS_USE_CASE)
    private readonly getReservationSlots: GetReservationSlotsUseCasePort,
    @Inject(GET_RESTAURANT_HOURS_USE_CASE)
    private readonly getRestaurantHours: GetRestaurantHoursUseCasePort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.createReservation.execute({
      userId: user.userId,
      email: user.email,
      type: dto.type,
      date: dto.date,
      time: dto.time,
      partySize: dto.partySize,
    });
    return new ReservationResponseDto(reservation);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationResponseDto[]> {
    const reservations = await this.listReservations.execute(user.userId);
    return reservations.map(
      (reservation) => new ReservationResponseDto(reservation),
    );
  }

  @Get('config/tour-slots')
  async tourSlots(@Query('date') date: string): Promise<SlotsResponseDto> {
    const slots = await this.getReservationSlots.execute(
      ReservationType.TOUR,
      date,
    );
    return new SlotsResponseDto(slots);
  }

  @Get('config/restaurant-slots')
  async restaurantSlots(
    @Query('date') date: string,
  ): Promise<SlotsResponseDto> {
    const slots = await this.getReservationSlots.execute(
      ReservationType.RESTAURANT,
      date,
    );
    return new SlotsResponseDto(slots);
  }

  @Get('config/restaurant-hours')
  async restaurantHours(): Promise<RestaurantHoursResponseDto> {
    const schedule = await this.getRestaurantHours.execute();
    return new RestaurantHoursResponseDto(schedule);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.updateReservation.execute({
      userId: user.userId,
      reservationId: id,
      date: dto.date,
      time: dto.time,
      partySize: dto.partySize,
    });
    return new ReservationResponseDto(reservation);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ id: string }> {
    await this.cancelReservation.execute({
      userId: user.userId,
      reservationId: id,
    });
    return { id };
  }
}
