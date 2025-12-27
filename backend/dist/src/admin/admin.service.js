"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listTeams() {
        return this.prisma.team.findMany({
            include: {
                owners: { select: { id: true, email: true, role: true } },
                players: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async createTeam(dto) {
        const ownerEmail = dto.ownerEmail.toLowerCase();
        const existing = await this.prisma.user.findUnique({
            where: { email: ownerEmail },
        });
        if (existing)
            throw new common_1.BadRequestException('Owner email already exists');
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
    async createPlayers(dto) {
        const names = dto.names.map((n) => n.trim()).filter(Boolean);
        if (names.length === 0)
            throw new common_1.BadRequestException('No valid player names');
        const existing = await this.prisma.player.findMany({
            where: { name: { in: names } },
            select: { name: true },
        });
        const existingSet = new Set(existing.map((p) => p.name));
        const toCreate = names.filter((n) => !existingSet.has(n));
        if (toCreate.length === 0)
            return { created: 0, skipped: names.length };
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
    async updateSettings(dto) {
        await this.getSettings();
        return this.prisma.settings.update({
            where: { id: 1 },
            data: dto,
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map