import SocketIO from 'socket.io';
import { generate } from 'shortid';
import { Player, buildPlayer, reshapePlayer } from '../player';
import { GameState } from '../game';
import { buildGameRoom } from './gameManager';
import { io } from '../main';

const buildRoomsManager = () => {
    let roomId: string;
    let idlePlayers: Player[] = [];
    let gameLauncher: NodeJS.Timeout;

    const joinIdleRoom = (socket: SocketIO.Socket, nickname: string) => {
        if (!roomId) {
            roomId = generate();
        }

        idlePlayers.push(buildPlayer(socket, nickname));
        socket.join(roomId);
        socket.emit('gameState', { gameState: GameState.WaitingForPlayers });
        io.to(roomId).emit('players', {
            players: idlePlayers.map(reshapePlayer)
        });

        checkRoomState();
    };

    const checkRoomState = () => {
        if (idlePlayers.length === 5) {
            io.to(roomId).emit('gameState', { gameState: GameState.AboutToLock });
            gameLauncher = setTimeout(launchGame, 10000);
        }

        if (idlePlayers.length === 50) {
            launchGame();
        }
    };

    const launchGame = () => {
        if (gameLauncher) {
            clearTimeout(gameLauncher);
        }

        const room = buildGameRoom({ roomId, idlePlayers });
        room.prepareGame();
        idlePlayers = [];
    };

    return { joinIdleRoom };
};

export const roomsManager = buildRoomsManager();
