import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';

type SocketData = {
  user?: Record<string, unknown>;
};

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload: unknown = await this.jwt.verifyAsync(token);
      const userPayload: Record<string, unknown> =
        payload && typeof payload === 'object'
          ? (payload as Record<string, unknown>)
          : {};

      (client.data as SocketData).user = userPayload;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // no-op
  }

  emitAuctionState(state: unknown) {
    this.server.emit('auction:state', state);
  }

  emitBidEvent(event: unknown) {
    this.server.emit('auction:bid', event);
  }
}
