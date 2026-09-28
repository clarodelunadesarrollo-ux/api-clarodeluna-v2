import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    DELETE_ALL_CLIENTS_USE_CASE,
    DeleteAllClientsUseCasePort,
} from '../../application/ports/in/delete-all-clients.port';
import {
    DELETE_CLIENT_USE_CASE,
    DeleteClientUseCasePort,
} from '../../application/ports/in/delete-client.port';
import {
    LIST_CLIENTS_USE_CASE,
    ListClientsUseCasePort,
} from '../../application/ports/in/list-clients.port';
import { ClientResponseDto } from '../dtos/client-response.dto';

// Admin surface to manage client accounts. Protected by the global
// JwtAuthGuard AND role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('users/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersAdminController {
  constructor(
    @Inject(LIST_CLIENTS_USE_CASE)
    private readonly listClients: ListClientsUseCasePort,
    @Inject(DELETE_CLIENT_USE_CASE)
    private readonly deleteClient: DeleteClientUseCasePort,
    @Inject(DELETE_ALL_CLIENTS_USE_CASE)
    private readonly deleteAllClients: DeleteAllClientsUseCasePort,
  ) {}

  @Get()
  async clients(): Promise<ClientResponseDto[]> {
    const clients = await this.listClients.execute();
    return clients.map((client) => new ClientResponseDto(client));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeClient(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ id: string }> {
    await this.deleteClient.execute(id);
    return { id };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeAllClients(): Promise<{ deleted: number }> {
    const deleted = await this.deleteAllClients.execute();
    return { deleted };
  }
}
