import express from 'express';
import http from 'http';
import path from 'path';
import SocketIO from 'socket.io';
import dotenv from 'dotenv-safe';
import { dispatcher } from './sockets/dispatcher';
import { login } from './middlewares/login';
import { monitor } from './monitor';

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = SocketIO(server);

io.on('connection', (socket: SocketIO.Socket) => {
    dispatcher.handleSocket(socket);
});

app.use('/', express.static('../web/build'));

app.get('/monitor', login, monitor);

app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../../web/build/index.html'));
});

server.listen(3001);
