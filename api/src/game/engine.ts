import { EventEmitter } from 'events';
import { Player, ChosenAnswer, reshapePlayer } from '../player';
import { io } from '../main';
import { GameState } from '../game';
import { buildQuestionGenerator } from './questions';

// TODO: extract game logic in ../game.ts
export const buildEngine = (roomId: string, isPrivate: boolean) => {
    const timeBeforeLock = parseInt(process.env.TIME_BEFORE_LOCK || '0', 10);
    const timeBeforeGameLaunch = parseInt(
        process.env.TIME_BEFORE_LAUNCH || '0',
        10
    );
    const timeToAnswer = parseInt(process.env.TIME_TO_ANSWER || '0', 10);
    const timeToDisplayAnswers = parseInt(
        process.env.TIME_TO_DISPLAY_ANSWERS || '0',
        10
    );
    const playersById: Map<string, Player> = new Map();
    let gameState: GameState = GameState.WaitingForPlayers;
    let nextState: number | null = null;
    let nextStepTimer: NodeJS.Timeout;
    const eventEmitter = new EventEmitter();
    const generator = buildQuestionGenerator();

    const isRoomLocked = () =>
        !(
            gameState === GameState.WaitingForPlayers ||
            gameState === GameState.AboutToLock
        );

    const attachListenersToPlayer = (newPlayer: Player) => {
        let player = newPlayer;
        const oldPlayer = playersById.get(player.id);

        if (oldPlayer) {
            if (oldPlayer.socket.id !== player.socket.id) {
                // Prevent disconnect listener to be called
                oldPlayer.socket.removeAllListeners();
                oldPlayer.socket.disconnect(true);
            }

            player = {
                ...oldPlayer,
                nickname: player.nickname,
                socket: player.socket,
                offline: false
            };
        }

        if (!oldPlayer && isRoomLocked()) {
            player.socket.disconnect(true);
            return;
        }

        player.socket.join(roomId);

        if (
            isPrivate &&
            (Array.from(playersById.keys()).length === 0 || player.isRoomMaster)
        ) {
            setPlayerRoomMaster(player);
        }

        player.socket.on('disconnect', () => {
            if (gameState === GameState.WaitingForPlayers) {
                removePlayer(player);
            } else {
                player.offline = true;
            }

            if (player.isRoomMaster) {
                electNewRoomMaster();
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

            player.hiddenAnswer = message.vote;
            player.answer = ChosenAnswer.Answered;

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

    const removePlayer = (player: Player) => {
        playersById.delete(player.id);
    };

    const setPlayerRoomMaster = (player: Player) => {
        player.isRoomMaster = true;
        player.socket.on('startGame', () => {
            if (
                gameState === GameState.WaitingForPlayers &&
                Array.from(playersById.keys()).length > 2
            ) {
                launchGame();
            }
        });

        player.socket.on('resetRoom', () => {
            if (gameState === GameState.Finished) {
                resetRoom();
            }
        });
    };

    const resetRoom = () => {
        const players = Array.from(playersById.values());

        for (const player of players) {
            if (player.offline) {
                removePlayer(player);
            } else {
                player.lives = 3;
            }
        }

        gameState = GameState.WaitingForPlayers;
        nextState = null;

        sendGameState();
        sendPlayers();
        sendCurrentQuestion();
    };

    const checkIfReadyToLauch = () => {
        const players = Array.from(playersById.values());

        if (
            players.length === 5 &&
            gameState === GameState.WaitingForPlayers &&
            !isPrivate
        ) {
            gameState = GameState.AboutToLock;
            nextState = Date.now() + timeBeforeLock;
            sendGameState();
            nextStepTimer = setTimeout(launchGame, timeBeforeLock);
        }

        if (players.length === 50) {
            launchGame();
        }
    };

    const sendGameState = () => {
        io.to(roomId).emit('gameState', {
            gameState,
            nextState,
            isPrivate
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
        generator.generate();
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
        const players = Array.from(playersById.values());

        for (const player of players) {
            player.answer = null;
            player.hiddenAnswer = null;
        }

        sendPlayers();
    };

    const sendPlayers = () => {
        io.to(roomId).emit('players', {
            players: Array.from(playersById.values()).map(reshapePlayer)
        });
    };

    const sendCurrentQuestion = () => {
        io.to(roomId).emit('currentQuestion', generator.lastQuestion);
    };

    const endGame = () => {
        gameState = GameState.Finished;
        nextState = null;
        sendGameState();
        electNewRoomMaster();
        restorePlayers();
        checkIfRoomToDestroy();
    };

    const electNewRoomMaster = () => {
        if (
            (gameState !== GameState.WaitingForPlayers &&
                gameState !== GameState.Finished) ||
            !isPrivate
        ) {
            return;
        }

        const players = Array.from(playersById.values());
        let firstPlayerOnline: Player | null = null;
        let hasRoomMaster = false;
        for (const player of players) {
            if (!player.offline && !firstPlayerOnline) {
                firstPlayerOnline = player;
            }

            if (player.isRoomMaster) {
                if (!player.offline) {
                    hasRoomMaster = true;
                } else {
                    player.isRoomMaster = false;
                }
            }
        }

        if (!hasRoomMaster && firstPlayerOnline) {
            setPlayerRoomMaster(firstPlayerOnline);
        }
    };

    const checkIfRoomToDestroy = () => {
        const players = Array.from(playersById.values());

        if (
            players.filter(p => !p.offline).length === 0 &&
            (gameState === GameState.Finished ||
                gameState === GameState.WaitingForPlayers)
        ) {
            eventEmitter.emit('destroy');
        }
    };

    return {
        handlePlayer,
        roomId,
        get gameState() {
            return gameState;
        },
        get nextState() {
            return nextState;
        },
        playersById,
        eventEmitter,
        get lastQuestion() {
            return generator.lastQuestion;
        },
        isPrivate
    };
};
