import { EventEmitter } from 'events';
import { io } from '../main';
import { buildGame } from '../engine/game';
import { GameState } from '../game';
import { Player, reshapePlayer, ChosenAnswer } from '../player';

export type Room = ReturnType<typeof buildRoom>;

export const buildRoom = (roomId: string, isPrivate: boolean) => {
    const socketsById: Map<string, SocketIO.Socket> = new Map();
    const emitter = new EventEmitter();
    const game = buildGame(isPrivate);

    game.emitter.on('question', () => {
        io.to(roomId).emit('currentQuestion', game.generator.lastQuestion);
    });

    game.emitter.on('gameState', () => {
        const { gameState, duration } = game;
        io.to(roomId).emit('gameState', { gameState, duration, isPrivate });

        if (gameState === GameState.AboutToStart) {
            emitter.emit('lock');
        }

        if (gameState === GameState.Finished) {
            checkIfRoomToDestroy();
        }
    });

    game.emitter.on('players', (players: Player[]) => {
        io.to(roomId).emit(
            'players',
            players.map(player =>
                reshapePlayer(player, socketsById.get(player.id)!)
            )
        );
    });

    const isGameLocked = () =>
        game.gameState !== GameState.WaitingForPlayers &&
        game.gameState !== GameState.AboutToLock;

    const handleSocket = (
        socket: SocketIO.Socket,
        playerId: string,
        nickname: string
    ) => {
        const formerSocket = socketsById.get(playerId);
        if (formerSocket && formerSocket.connected) {
            socket.emit('error', 'playerAlreadyConnected');
            return;
        }

        if (!formerSocket && isGameLocked()) {
            socket.emit('error', 'roomLocked');
            return;
        }

        if (!formerSocket) {
            game.addPlayer(playerId, nickname);
        }

        socketsById.set(playerId, socket);
        socket.join(roomId);

        attachListenersToSocket(playerId, socket);
    };

    const attachListenersToSocket = (
        playerId: string,
        socket: SocketIO.Socket
    ) => {
        socket.on('disconnected', () => {
            game.setPlayerOffline(playerId);
            if (!isGameLocked()) {
                socketsById.delete(playerId);
                game.removePlayer(playerId);
            }

            checkIfRoomToDestroy();
        });

        socket.on('vote', ({ vote }: { vote: ChosenAnswer }) => {
            game.handlePlayerAnswer(playerId, vote);
        });

        socket.on('getState', () => {
            const { players, gameState, generator } = game;
            socket.emit('players', players);
            socket.emit('gameState', { gameState, isPrivate });
            socket.emit('question', generator.lastQuestion);
        });

        socket.on('startGame', () => {
            game.handleStartGame(playerId);
        });

        socket.on('resetRoom', () => {
            game.handleRoomReset(playerId);
        });
    };

    const checkIfRoomToDestroy = () => {
        const sockets = Array.from(socketsById.values());

        if (
            sockets.filter(socket => socket.connected).length === 0 &&
            !isGameLocked()
        ) {
            emitter.emit('destroy');
        }
    };

    return {
        roomId,
        socketsById,
        game,
        emitter,
        handleSocket
    };
};
