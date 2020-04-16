import { EventEmitter } from 'events';
import { Player, ChosenAnswer, reshapePlayer } from '../player';
import { io } from '../main';
import { GameState } from '../game';

import questions from '../../database/vox-questions.json';
import answers from '../../database/vox-answers.json';

const timeBeforeGameLaunch = 5000;
const timeToAnswer = 30000;
const timeToDisplayAnswers = 5000;

// TODO: extract game logic in ../game.ts
export const buildGameRoom = (roomId: string) => {
    const playersById: Map<string, Player> = new Map();
    let gameState: GameState = GameState.WaitingForPlayers;
    let nextState: number | null = null;
    let nextStepTimer: NodeJS.Timeout;
    let currentQuestion: string;
    let currentAnswers: string[];
    const eventEmitter = new EventEmitter();

    const isRoomLocked = () =>
        !(GameState.WaitingForPlayers || GameState.AboutToLock);

    const attachListenersToPlayer = (player: Player) => {
        const oldPlayer = playersById.get(player.id);

        if (oldPlayer && oldPlayer.socket.id !== player.socket.id) {
            // Prevent disconnect listener to be called
            oldPlayer.socket.removeAllListeners();
            oldPlayer.socket.disconnect(true);
        }

        if (!oldPlayer && isRoomLocked()) {
            player.socket.disconnect(true);
            return;
        }

        player.socket.join(roomId);

        player.socket.on('disconnect', () => {
            const playerToUpdate = playersById.get(player.id);
            if (playerToUpdate) {
                playersById.set(player.id, {
                    ...playerToUpdate,
                    offline: true
                });
            }

            sendPlayers();
            checkIfRoomToDestroy();
        });

        player.socket.on('getState', () => {
            sendGameState();
            sendPlayers();
            sendCurrentQuestion();
        });

        player.socket.on('vote', (message: any) => {
            if (player.lives === 0 || gameState !== GameState.WaitingForAnswers)
                return;

            playersById.set(player.id, {
                ...player,
                hiddenAnswer: message.vote,
                answer: ChosenAnswer.Answered
            });

            sendPlayers();

            const players = Array.from(playersById.values());
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

        return player;
    };

    const handlePlayer = (player: Player) => {
        const readyToPlayPlayer = attachListenersToPlayer(player);

        if (readyToPlayPlayer) {
            playersById.set(readyToPlayPlayer.id, readyToPlayPlayer);
        }

        if (!isRoomLocked()) checkIfReadyToLauch();
    };

    const checkIfReadyToLauch = () => {
        const players = Array.from(playersById.values());

        if (players.length === 5) {
            gameState = GameState.AboutToLock;
            nextState = Date.now() + 10000;
            sendGameState();
            nextStepTimer = setTimeout(launchGame, 10000);
        }

        if (players.length === 50) {
            launchGame();
        }
    };

    const sendGameState = () => {
        io.to(roomId).emit('gameState', {
            gameState,
            nextState
        });
    };

    const launchGame = () => {
        clearTimeout(nextStepTimer);
        eventEmitter.emit('lock');
        gameState = GameState.AboutToStart;
        nextState = timeBeforeGameLaunch + Date.now();
        sendGameState();

        nextStepTimer = setTimeout(
            () => generateQuestion(),
            timeBeforeGameLaunch
        );
    };

    const generateQuestion = () => {
        currentQuestion =
            questions[Math.floor(Math.random() * questions.length)];
        currentAnswers = [
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)]
        ];

        gameState = GameState.WaitingForAnswers;
        nextState = timeToAnswer + Date.now();
        sendCurrentQuestion();
        sendGameState();
        restorePlayers();

        nextStepTimer = setTimeout(() => endTurn(), timeToAnswer);
    };

    const endTurn = () => {
        const answersScores: Map<ChosenAnswer, number> = new Map();
        const players = Array.from(playersById.values());

        for (const player of players) {
            playersById.set(player.id, {
                ...player,
                answer: player.hiddenAnswer
            });

            if (player.hiddenAnswer == null) {
                continue;
            }

            const currentAnswerScore =
                answersScores.get(player.hiddenAnswer) || 0;
            answersScores.set(player.hiddenAnswer, currentAnswerScore + 1);
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
            let lives = player.lives;
            if (
                player.hiddenAnswer === null ||
                winningAnswers.indexOf(player.hiddenAnswer) === -1
            ) {
                lives = Math.max(lives - 1, 0);

                playersById.set(player.id, {
                    ...player,
                    lives
                });
            }

            if (lives > 0) {
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
        const players = Array.from(playersById.values());

        for (const player of players) {
            playersById.set(player.id, {
                ...player,
                answer: null,
                hiddenAnswer: null
            });
        }

        sendPlayers();
    };

    const sendPlayers = () => {
        io.to(roomId).emit('players', {
            players: Array.from(playersById.values()).map(reshapePlayer)
        });
    };

    const sendCurrentQuestion = () => {
        if (currentQuestion && currentAnswers) {
            io.to(roomId).emit('currentQuestion', {
                question: currentQuestion,
                answers: currentAnswers
            });
        }
    };

    const endGame = () => {
        restorePlayers();
        gameState = GameState.Finished;
        nextState = null;
        sendGameState();
        checkIfRoomToDestroy();
    };

    const checkIfRoomToDestroy = () => {
        const players = Array.from(playersById.values());

        if (
            players.filter(p => !p.offline).length === 0 &&
            gameState === GameState.Finished
        ) {
            eventEmitter.emit('destroy');
        }
    };

    return { handlePlayer, gameState, nextState, playersById, eventEmitter };
};
