import { Player, ChosenAnswer, reshapePlayer } from '../player';
import { io } from '../main';
import { GameState } from '../game';

import questions from '../../database/vox-questions.json';
import answers from '../../database/vox-answers.json';

const timeBeforeGameLaunch = 5000;
const timeToAnswer = 10000;
const timeToDisplayAnswers = 5000;

interface BuilderPayload {
    roomId: string;
    idlePlayers: Player[];
}

export const buildGameRoom = ({ roomId, idlePlayers }: BuilderPayload) => {
    let players: Player[] = idlePlayers;
    let gameState: GameState = GameState.AboutToStart;

    const prepareGame = () => {
        for (const player of players) {
            player.socket.on('vote', (message: any) => {
                if (
                    player.lives === -1 ||
                    gameState !== GameState.WaitingForAnswers
                )
                    return;

                player.hiddenAnswer = message.vote;
                player.answer = ChosenAnswer.Answered;

                io.to(roomId).emit('players', {
                    players: players.map(reshapePlayer)
                });
            });
        }

        io.to(roomId).emit('gameState', {
            gameState,
            nextState: timeBeforeGameLaunch + Date.now()
        });

        setTimeout(() => generateQuestion(), timeBeforeGameLaunch);
    };

    const generateQuestion = () => {
        for (const player of players) {
            player.answer = null;
            player.hiddenAnswer = null;
        }

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
        gameState = GameState.WaitingForAnswers;
        io.to(roomId).emit('gameState', {
            gameState,
            nextState: timeToAnswer + Date.now()
        });
        io.to(roomId).emit('players', { players: players.map(reshapePlayer) });

        setTimeout(() => endTurn(), timeToAnswer);
    };

    const endTurn = () => {
        const answersScores: Map<ChosenAnswer, number> = new Map();

        for (const player of players) {
            player.answer = player.hiddenAnswer;

            if (player.answer == null) {
                continue;
            }

            const currentAnswerScore = answersScores.get(player.answer) || 0;
            answersScores.set(player.answer, currentAnswerScore + 1);
        }

        let max = 0;
        const winningAnswers = Array.from(answersScores.entries()).reduce(
            (winners, [key, amount]) => {
                if (amount > max) {
                    max = amount;
                    return [key];
                } else if (amount === max) {
                    return [...winners, key];
                }

                return winners;
            },
            [] as ChosenAnswer[]
        );

        let playersAlive = 0;
        for (const player of players) {
            if (
                player.answer === null ||
                winningAnswers.indexOf(player.answer) === -1
            ) {
                player.lives = Math.max(player.lives - 1, -1);
            }

            if (player.lives > -1) {
                playersAlive += 1;
            }
        }

        gameState = GameState.DisplayScores;
        io.to(roomId).emit('gameState', {
            gameState,
            nextState: timeToDisplayAnswers + Date.now()
        });
        io.to(roomId).emit('players', { players: players.map(reshapePlayer) });

        if (playersAlive <= 2) {
            return setTimeout(() => endGame(), timeToDisplayAnswers);
        }

        setTimeout(() => generateQuestion(), timeToDisplayAnswers);
    };

    const endGame = () => {
        gameState = GameState.Finished;
        io.to(roomId).emit('gameState', { gameState });
    };

    return { prepareGame };
};
