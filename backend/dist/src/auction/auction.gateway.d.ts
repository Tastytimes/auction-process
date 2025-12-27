import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
export declare class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwt;
    server: Server;
    constructor(jwt: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(_client: Socket): void;
    emitAuctionState(state: unknown): void;
    emitBidEvent(event: unknown): void;
}
