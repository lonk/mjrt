import { EventEmitter } from 'events';
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
            socket.emit('registration', { code: RegisterState.AlreadyConnected });
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
        } else {
            game.handleOfflineState(playerId, false);
        }

        attachListenersToSocket(playerId, socket);
    };

    const attachListenersToSocket = (
        playerId: string,
        socket: SocketIO.Socket
    ) => {
        socket.on('disconnect', () => {
            game.handleOfflineState(playerId, true);
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
            const {
                players,
                gameState,
                duration,
                stateStart,
                generator
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
                isPrivate
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
