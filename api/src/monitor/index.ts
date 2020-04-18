import { Request, Response } from 'express';
import { roomsManager } from '../game/roomsManager';

export const monitor = (req: Request, res: Response) => {
    const rooms = Array.from(roomsManager.roomsById.values()).map(room => ({
        id: room.roomId,
        gameState: room.gameState,
        nextState: room.nextState,
        currentQuestion: room.currentQuestion,
        currentAnswers: room.currentAnswers,
        isPrivate: room.isPrivate,
        players: Array.from(room.playersById.values()).map(player => ({
            id: player.id,
            sessionId: player.socket.id,
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
