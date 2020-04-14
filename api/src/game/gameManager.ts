import { Player, ChosenAnswer, reshapePlayer } from '../player';
import { io } from '../main';
import { GameState } from '../game';

import questions from '../../database/vox-questions.json';
import answers from '../../database/vox-answers.json';

interface BuilderPayload {
    roomId: string;
    idlePlayers: Player[];
}

export const buildGameRoom = ({ roomId, idlePlayers }: BuilderPayload) => {
    let players: Player[] = idlePlayers;

    const prepareGame = () => {
        for (const player of players) {
            player.socket.on('vote', (message: any) => {
                player.hiddenAnswer = message.vote;
                player.answer = ChosenAnswer.Answered;

                io.to(roomId).emit('players', {
                    players: players.map(reshapePlayer)
                });
            });
        }

        io.to(roomId).emit('gameState', { gameState: GameState.AboutToStart });

        setTimeout(generateQuestion, 10000);
    };

    const generateQuestion = () => {
        const question =
            questions[Math.floor(Math.random() * questions.length)];
        const generatedAnswers = [
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)]
        ];

        io.to(roomId).emit('currentQuestion', {
            question,
            answers: generatedAnswers
        });
        io.to(roomId).emit('gameState', {
            gameState: GameState.WaitingForAnswers
        });
        io.to(roomId).emit('players', { players: players.map(reshapePlayer) });

        setTimeout(endTurn, 5000);
    };

    const endTurn = () => {
        for (const player of players) {
            player.answer = player.hiddenAnswer;
            player.lives -= 1;
        }

        io.to(roomId).emit('gameState', { gameState: GameState.DisplayScores });
        io.to(roomId).emit('players', { players: players.map(reshapePlayer) });

        for (const player of players) {
            player.answer = null;
            player.hiddenAnswer = null;
        }

        const playersAlives = players.filter(({ lives }) => lives > 0).length;

        if (playersAlives <= 2) {
            return endGame();
        }

        setTimeout(generateQuestion, 5000);
    };

    const endGame = () => {
        io.to(roomId).emit('gameState', { gameState: GameState.Finished });
    };

    return { prepareGame };
};
