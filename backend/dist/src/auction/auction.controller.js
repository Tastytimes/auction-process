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
exports.AuctionController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/current-user.decorator");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_guard_1 = require("../common/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auction_service_1 = require("./auction.service");
const place_bid_dto_1 = require("./dto/place-bid.dto");
const start_auction_dto_1 = require("./dto/start-auction.dto");
let AuctionController = class AuctionController {
    auction;
    constructor(auction) {
        this.auction = auction;
    }
    getState() {
        return this.auction.getPublicState();
    }
    upcoming() {
        return this.auction.listUpcomingPlayers();
    }
    results() {
        return this.auction.listResults();
    }
    start(user, dto) {
        return this.auction.startAuction(user, dto.playerId);
    }
    close(user) {
        return this.auction.closeAuction(user);
    }
    bid(user, dto) {
        return this.auction.placeBid(user, dto.amount);
    }
};
exports.AuctionController = AuctionController;
__decorate([
    (0, common_1.Get)('state'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuctionController.prototype, "getState", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuctionController.prototype, "upcoming", null);
__decorate([
    (0, common_1.Get)('results'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuctionController.prototype, "results", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)('start'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_auction_dto_1.StartAuctionDto]),
    __metadata("design:returntype", void 0)
], AuctionController.prototype, "start", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Post)('close'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuctionController.prototype, "close", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('OWNER'),
    (0, common_1.Post)('bid'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, place_bid_dto_1.PlaceBidDto]),
    __metadata("design:returntype", void 0)
], AuctionController.prototype, "bid", null);
exports.AuctionController = AuctionController = __decorate([
    (0, common_1.Controller)('auction'),
    __metadata("design:paramtypes", [auction_service_1.AuctionService])
], AuctionController);
//# sourceMappingURL=auction.controller.js.map