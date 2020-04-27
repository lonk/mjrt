import { EventEmitter } from 'events';
import { nbRooms, nbOnlinePlayers, nbSockets } from '../metrics';
import { io } from '../main';
import { buildGame } from '../engine/game';
import { GameState } from '../game';
import { reshapePlayer, ChosenAnswer } from '../player';

export type Room = ReturnType<typeof buildRoom>;

enum RegisterState {
    Pending,
    Registered,
    AlreadyConnected,
    RoomLocked
}

export const buildRoom = (roomId: string, isPrivate: boolean) => {
    const socketsById: Map<string, SocketIO.Socket> = new Map();
    const emitter = new EventEmitter();
    const game = buildGame(isPrivate);
    nbRooms.labels(isPrivate ? 'private' : 'public').inc();

    game.emitter.on('question', () => {
        io.to(roomId).emit('currentQuestion', game.generator.lastQuestion);
    });

    game.emitter.on('gameState', () => {
        const { gameState, duration, round, lastWinningAnswers } = game;
        io.to(roomId).emit('gameState', {
            gameState,
            duration,
            round,
            isPrivate,
            lastWinningAnswers
        });

        if (gameState === GameState.WaitingForPlayers) {
            purgeRoom();
        }

        if (gameState === GameState.AboutToStart) {
            emitter.emit('lock');
        }

        if (gameState === GameState.Finished) {
            checkIfRoomToDestroy();
        }
    });

    game.emitter.on('players', () => {
        const { players } = game;
        io.to(roomId).emit('players', {
            players: players.map(player =>
                reshapePlayer(player, socketsById.get(player.id)!)
            )
        });
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
            socket.emit('registration', {
                code: RegisterState.AlreadyConnected
            });
            return;
        }

        if (!formerSocket && isGameLocked()) {
            socket.emit('registration', { code: RegisterState.RoomLocked });
            return;
        }

        socket.emit('registration', { code: RegisterState.Registered, roomId });

        socketsById.set(playerId, socket);
        socket.join(roomId);

        if (!formerSocket) {
            game.addPlayer(playerId, nickname);
            nbSockets.labels(roomId).inc(1);
        } else {
            game.handleOfflineState(playerId, false);
        }

        nbOnlinePlayers.labels(roomId).inc();
        attachListenersToSocket(playerId, socket);
    };

    const attachListenersToSocket = (
        playerId: string,
        socket: SocketIO.Socket
    ) => {
        socket.on('disconnect', () => {
            nbOnlinePlayers.labels(roomId).dec();
            game.handleOfflineState(playerId, true);
            if (!isGameLocked()) {
                socketsById.delete(playerId);
                game.removePlayer(playerId);
                nbSockets.labels(roomId).dec();
            }

            checkIfRoomToDestroy();
        });

        socket.on('vote', ({ vote }: { vote: ChosenAnswer }) => {
            game.handlePlayerAnswer(playerId, vote);
        });

        socket.on('getState', () => {
            const {
                players,
                gameState,
                duration,
                stateStart,
                generator,
                round,
                lastWinningAnswers
            } = game;
            const elapsedDuration = Date.now() - stateStart;
            const remainingDuration = duration
                ? duration - elapsedDuration
                : null;
            socket.emit('players', {
                players: players.map(player =>
                    reshapePlayer(player, socketsById.get(player.id)!)
                )
            });
            socket.emit('gameState', {
                gameState,
                duration: remainingDuration,
                isPrivate,
                round,
                lastWinningAnswers
            });

            if (generator.lastQuestion) {
                socket.emit('currentQuestion', generator.lastQuestion);
            }
        });

        socket.on('startGame', () => {
            game.handleStartGame(playerId);
        });

        socket.on('resetRoom', () => {
            game.handleRoomReset(playerId);
        });
    };

    const purgeRoom = () => {
        const sockets = Array.from(socketsById.entries());

        for (const [playerId, socket] of sockets) {
            if (socket.disconnected) {
                game.removePlayer(playerId);
                socketsById.delete(playerId);
            }
        }
    };

    const checkIfRoomToDestroy = () => {
        const sockets = Array.from(socketsById.values());

        if (
            sockets.filter(socket => socket.connected).length === 0 &&
            (game.gameState === GameState.WaitingForPlayers ||
                game.gameState === GameState.Finished)
        ) {
            nbRooms.labels(isPrivate ? 'private' : 'public').dec();
            nbSockets.remove(roomId);
            nbOnlinePlayers.remove(roomId);
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
