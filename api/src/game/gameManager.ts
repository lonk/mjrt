import { Player, ChosenAnswer, reshapePlayer } from '../player';
import { io } from '../main';
import { GameState } from '../game';

import questions from '../../database/vox-questions.json';
import answers from '../../database/vox-answers.json';

const timeBeforeGameLaunch = 5000;
const timeToAnswer = 30000;
const timeToDisplayAnswers = 5000;

interface BuilderPayload {
    roomId: string;
    idlePlayers: Player[];
}

export const buildGameRoom = ({ roomId, idlePlayers }: BuilderPayload) => {
    let players: Player[] = idlePlayers;
    let gameState: GameState = GameState.AboutToStart;
    let nextState: number | null;
    let nextStepTimer: NodeJS.Timeout;

    const prepareGame = () => {
        for (const player of players) {
            player.socket.on('getState', () => {
                sendGameState();
                sendPlayers();
            });

            player.socket.on('vote', (message: any) => {
                if (
                    player.lives === 0 ||
                    gameState !== GameState.WaitingForAnswers
                )
                    return;

                player.hiddenAnswer = message.vote;
                player.answer = ChosenAnswer.Answered;

                sendPlayers();

                const unvotedPlayers = players.reduce(
                    (acc, player) =>
                        player.answer === ChosenAnswer.Answered ||
                        player.lives === 0
                            ? acc - 1
                            : acc,
                    players.length
                );

                if (unvotedPlayers === 0) {
                    clearTimeout(nextStepTimer);
                    endTurn();
                }
            });
        }

        nextState = timeBeforeGameLaunch + Date.now();
        sendGameState();

        nextStepTimer = setTimeout(
            () => generateQuestion(),
            timeBeforeGameLaunch
        );
    };

    const sendGameState = () => {
        io.to(roomId).emit('gameState', {
            gameState,
            nextState
        });
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
        gameState = GameState.WaitingForAnswers;
        nextState = timeToAnswer + Date.now();
        sendGameState();
        restorePlayers();

        nextStepTimer = setTimeout(() => endTurn(), timeToAnswer);
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
                player.lives = Math.max(player.lives - 1, 0);
            }

            if (player.lives > 0) {
                playersAlive += 1;
            }
        }

        gameState = GameState.DisplayScores;
        nextState = timeToDisplayAnswers + Date.now();
        sendGameState();
        sendPlayers();

        if (playersAlive <= 2) {
            nextStepTimer = setTimeout(() => endGame(), timeToDisplayAnswers);
            return;
        }

        nextStepTimer = setTimeout(
            () => generateQuestion(),
            timeToDisplayAnswers
        );
    };

    const restorePlayers = () => {
        for (const player of players) {
            player.answer = null;
            player.hiddenAnswer = null;
        }

        sendPlayers();
    };

    const sendPlayers = () => {
        io.to(roomId).emit('players', { players: players.map(reshapePlayer) });
    };

    const endGame = () => {
        restorePlayers();
        gameState = GameState.Finished;
        nextState = null;
        io.to(roomId).emit('gameState', { gameState });
    };

    return { prepareGame };
};
