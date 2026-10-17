import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    CREATE_TOUR_STOP_USE_CASE,
    CreateTourStopUseCasePort,
} from '../../application/ports/in/create-tour-stop.port';
import {
    DELETE_TOUR_STOP_USE_CASE,
    DeleteTourStopUseCasePort,
} from '../../application/ports/in/delete-tour-stop.port';
import {
    GET_TOUR_STOP_USE_CASE,
    GetTourStopUseCasePort,
} from '../../application/ports/in/get-tour-stop.port';
import {
    LIST_TOUR_STOPS_USE_CASE,
    ListTourStopsUseCasePort,
} from '../../application/ports/in/list-tour-stops.port';
import {
    UPDATE_TOUR_STOP_USE_CASE,
    UpdateTourStopUseCasePort,
} from '../../application/ports/in/update-tour-stop.port';
import { CreateTourStopDto } from '../dtos/create-tour-stop.dto';
import { TourStopResponseDto } from '../dtos/tour-stop-response.dto';
import { UpdateTourStopDto } from '../dtos/update-tour-stop.dto';

// All routes are protected by the global JwtAuthGuard. The guest app consumes
// the read endpoints after check-in; the write endpoints are restricted to
// ADMIN via RolesGuard and are consumed by the admin app.
@Controller('tour/stops')
export class TourStopsController {
  constructor(
    @Inject(LIST_TOUR_STOPS_USE_CASE)
    private readonly listStops: ListTourStopsUseCasePort,
    @Inject(GET_TOUR_STOP_USE_CASE)
    private readonly getStop: GetTourStopUseCasePort,
    @Inject(CREATE_TOUR_STOP_USE_CASE)
    private readonly createStop: CreateTourStopUseCasePort,
    @Inject(UPDATE_TOUR_STOP_USE_CASE)
    private readonly updateStop: UpdateTourStopUseCasePort,
    @Inject(DELETE_TOUR_STOP_USE_CASE)
    private readonly deleteStop: DeleteTourStopUseCasePort,
  ) {}

  @Get()
  async list(): Promise<TourStopResponseDto[]> {
    const stops = await this.listStops.execute();
    return stops.map((stop) => new TourStopResponseDto(stop));
  }

  @Get(':id')
  async get(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TourStopResponseDto> {
    const stop = await this.getStop.execute(id);
    return new TourStopResponseDto(stop);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTourStopDto): Promise<TourStopResponseDto> {
    const stop = await this.createStop.execute(dto);
    return new TourStopResponseDto(stop);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTourStopDto,
  ): Promise<TourStopResponseDto> {
    const stop = await this.updateStop.execute(id, dto);
    return new TourStopResponseDto(stop);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteStop.execute(id);
  }
}
