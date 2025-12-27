import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AdminService } from './admin.service';
import { CreatePlayersDto } from './dto/create-players.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('teams')
  teams() {
    return this.admin.listTeams();
  }

  @Post('teams')
  createTeam(@Body() dto: CreateTeamDto) {
    return this.admin.createTeam(dto);
  }

  @Get('players')
  players() {
    return this.admin.listPlayers();
  }

  @Post('players')
  createPlayers(@Body() dto: CreatePlayersDto) {
    return this.admin.createPlayers(dto);
  }

  @Get('settings')
  settings() {
    return this.admin.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.admin.updateSettings(dto);
  }
}
