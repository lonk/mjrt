import { Request, Response } from 'express';
import { roomsManager } from '../game/roomsManager';

export const monitor = (req: Request, res: Response) => {
    const rooms = Array.from(roomsManager.roomsById.entries()).map(([id, room]) => ({
        id,
        gameState: room.gameState,
        nextState: room.nextState,
        currentQuestion: room.currentQuestion,
        currentAnswers: room.currentAnswers,
        players: Array.from(room.playersById.values()).map(player => ({
            id: player.id,
            nickname: player.nickname,
            offline: player.offline,
            answer: player.answer,
            hiddenAnswer: player.answer,
        }))
    }));

    res.json(rooms);
};
