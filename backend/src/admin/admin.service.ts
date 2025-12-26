import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayersDto } from './dto/create-players.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listTeams() {
    return this.prisma.team.findMany({
      include: {
        owners: { select: { id: true, email: true, role: true } },
        players: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTeam(dto: CreateTeamDto) {
    const ownerEmail = dto.ownerEmail.toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (existing) throw new BadRequestException('Owner email already exists');

    const passwordHash = await bcrypt.hash(dto.ownerPassword, 10);

    return this.prisma.team.create({
      data: {
        name: dto.name,
        purseTotal: dto.purseTotal,
        purseRemaining: dto.purseRemaining ?? dto.purseTotal,
        owners: {
          create: {
            email: ownerEmail,
            passwordHash,
            role: 'OWNER',
          },
        },
      },
      include: { owners: { select: { id: true, email: true, role: true } } },
    });
  }

  async listPlayers() {
    return this.prisma.player.findMany({
      include: { soldToTeam: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPlayers(dto: CreatePlayersDto) {
    const names = dto.names.map((n) => n.trim()).filter(Boolean);
    if (names.length === 0)
      throw new BadRequestException('No valid player names');

    // Create many; ignore duplicates by pre-filtering existing names.
    const existing = await this.prisma.player.findMany({
      where: { name: { in: names } },
      select: { name: true },
    });
    const existingSet = new Set(existing.map((p) => p.name));
    const toCreate = names.filter((n) => !existingSet.has(n));

    if (toCreate.length === 0) return { created: 0, skipped: names.length };

    await this.prisma.player.createMany({
      data: toCreate.map((name) => ({ name })),
    });

    return {
      created: toCreate.length,
      skipped: names.length - toCreate.length,
    };
  }

  async getSettings() {
    return this.prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  async updateSettings(dto: UpdateSettingsDto) {
    await this.getSettings();
    return this.prisma.settings.update({
      where: { id: 1 },
      data: dto,
    });
  }
}
