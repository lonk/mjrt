import { Request, Response } from 'express';
import { dispatcher } from '../sockets/dispatcher';

export const monitor = (req: Request, res: Response) => {
    const rooms = Array.from(dispatcher.roomsById.values()).map(room => ({
        id: room.roomId,
        gameState: room.game.gameState,
        stateStart: room.game.stateStart,
        duration: room.game.duration,
        lastQuestion: room.game.generator.lastQuestion,
        isPrivate: room.game.isPrivate,
        players: room.game.players.map(player => ({
            id: player.id,
            sessionId: room.socketsById.get(player.id)!.id,
            nickname: player.nickname,
            lives: player.lives,
            offline: player.offline,
            answer: player.answer,
            hiddenAnswer: player.hiddenAnswer,
            isRoomMaster: player.isRoomMaster
        }))
    }));

    res.json(rooms);
};
