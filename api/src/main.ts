import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { createServer } from 'http';
import express from 'express';
import { MjrtRoom } from './room';

const port = Number(process.env.port) || 3001;

const app = express();
app.use(express.json());

const gameServer = new Server({
    server: createServer(app)
});

gameServer.define('game', MjrtRoom);

app.use("/colyseus", monitor());

gameServer.listen(port);
