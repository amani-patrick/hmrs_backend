import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export class WebSocketConfig {
  createIOServer(port: number, options?: any): any {
    const server = require('http').createServer();
    const io = require('socket.io')(server, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      ...options,
    });

    // Store the server instance for later use
    WebSocketGateway(port, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
      },
    });

    return io;
  }
}
