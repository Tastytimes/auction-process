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
exports.AuctionGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const jwt_1 = require("@nestjs/jwt");
let AuctionGateway = class AuctionGateway {
    jwt;
    server;
    constructor(jwt) {
        this.jwt = jwt;
    }
    async handleConnection(client) {
        const token = client.handshake.auth?.token ??
            client.handshake.query?.token;
        if (!token) {
            client.disconnect(true);
            return;
        }
        try {
            const payload = await this.jwt.verifyAsync(token);
            const userPayload = payload && typeof payload === 'object'
                ? payload
                : {};
            client.data.user = userPayload;
        }
        catch {
            client.disconnect(true);
        }
    }
    handleDisconnect() {
    }
    emitAuctionState(state) {
        this.server.emit('auction:state', state);
    }
    emitBidEvent(event) {
        this.server.emit('auction:bid', event);
    }
};
exports.AuctionGateway = AuctionGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], AuctionGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuctionGateway.prototype, "handleConnection", null);
exports.AuctionGateway = AuctionGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/ws',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuctionGateway);
//# sourceMappingURL=auction.gateway.js.map