"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_guard_1 = require("../common/roles.guard");
const admin_service_1 = require("./admin.service");
const create_players_dto_1 = require("./dto/create-players.dto");
const create_team_dto_1 = require("./dto/create-team.dto");
const update_settings_dto_1 = require("./dto/update-settings.dto");
let AdminController = class AdminController {
    admin;
    constructor(admin) {
        this.admin = admin;
    }
    teams() {
        return this.admin.listTeams();
    }
    createTeam(dto) {
        return this.admin.createTeam(dto);
    }
    players() {
        return this.admin.listPlayers();
    }
    createPlayers(dto) {
        return this.admin.createPlayers(dto);
    }
    settings() {
        return this.admin.getSettings();
    }
    updateSettings(dto) {
        return this.admin.updateSettings(dto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('teams'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "teams", null);
__decorate([
    (0, common_1.Post)('teams'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_team_dto_1.CreateTeamDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createTeam", null);
__decorate([
    (0, common_1.Get)('players'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "players", null);
__decorate([
    (0, common_1.Post)('players'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_players_dto_1.CreatePlayersDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPlayers", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "settings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateSettingsDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSettings", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map