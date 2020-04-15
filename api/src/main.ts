import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import { roomsManager } from './game/roomsManager';

const app = express();
const server = http.createServer(app);
export const io = SocketIO(server);

io.on('connection', (socket: SocketIO.Socket) => {
    socket.on('setNickname', (payload: any) => {
        roomsManager.joinIdleRoom(socket, payload.nickname);
    });
});

app.use('/', express.static('../../web/build'));

server.listen(3001);
