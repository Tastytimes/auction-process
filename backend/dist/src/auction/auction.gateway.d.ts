import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
export declare class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwt;
    server: Server;
    constructor(jwt: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(): void;
    emitAuctionState(state: unknown): void;
    emitBidEvent(event: unknown): void;
}
