import express from 'express';
import http from 'http';
import path from 'path';
import SocketIO from 'socket.io';
import { roomsManager } from './game/roomsManager';

const app = express();
const server = http.createServer(app);
export const io = SocketIO(server);

io.on('connection', (socket: SocketIO.Socket) => {
    roomsManager.joinIdleRoom(socket);
});

app.use('/', express.static('../../web/build'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../web/build/index.html'));
});

server.listen(3001);
