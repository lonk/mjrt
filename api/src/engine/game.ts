import { EventEmitter } from 'events';
import { Player, buildPlayer, ChosenAnswer, PlayerEmote } from '../player';
import { GameState } from '../game';
import { buildQuestionGenerator } from './questions';
import { computePlayersAlive } from './tools/computePlayersAlive';
import { computeMissingVotes } from './tools/computeMissingVotes';
import { getTimers } from './tools/getTimers';
import { findNewRoomMaster } from './tools/findNewRoomMaster';

export type Game = ReturnType<typeof buildGame>;

export const buildGame = (isPrivate: boolean) => {
    const {
        timeBeforeLock,
        timeBeforeGameLaunch,
        timeToAnswer,
        timeToDisplayAnswers
    } = getTimers();
    const generator = buildQuestionGenerator();
    let playersById: Map<string, Player> = new Map();
    const emitter = new EventEmitter();
    let gameState: GameState = GameState.WaitingForPlayers;
    let stateStart: number = Date.now();
    let duration: number | null = null;
    let nextStepTimer: NodeJS.Timeout;
    let round: number = 0;
    let lastWinningAnswers: ChosenAnswer[] = [];

    const addPlayer = (playerId: string, nickname: string) => {
        const isRoomMaster =
            Array.from(playersById.values()).length === 0 && isPrivate;
        const gameAlreadyStarted = ![
            GameState.WaitingForPlayers,
            GameState.AboutToLock
        ].includes(gameState);

        const player = buildPlayer(
            playerId,
            nickname,
            isRoomMaster,
            gameAlreadyStarted
        );

        playersById.set(playerId, player);
        sendPlayers();
        checkIfReadyToLauch();
    };

    const removePlayer = (playerId: string) => {
        playersById.delete(playerId);
        electNewRoomMaster();
    };

    const updateGameState = (newGameState: GameState) => {
        gameState = newGameState;
        stateStart = Date.now();

        switch (gameState) {
            case GameState.AboutToLock:
                duration = timeBeforeLock;
                break;
            case GameState.AboutToStart:
                duration = timeBeforeGameLaunch;
                break;
            case GameState.WaitingForAnswers:
                duration = timeToAnswer;
                break;
            case GameState.DisplayScores:
                duration = timeToDisplayAnswers;
                break;
            default:
                duration = null;
        }
        emitter.emit('gameState');
    };

    const checkIfReadyToLauch = () => {
        const players = Array.from(playersById.values());

        if (
            players.length === 5 &&
            gameState === GameState.WaitingForPlayers &&
            !isPrivate
        ) {
            updateGameState(GameState.AboutToLock);
            nextStepTimer = setTimeout(launchGame, timeBeforeLock);
        }

        if (players.length === 50) {
            launchGame();
        }
    };

    const launchGame = () => {
        round = 0;
        clearTimeout(nextStepTimer);
        updateGameState(GameState.AboutToStart);
        nextStepTimer = setTimeout(generateQuestion, timeBeforeGameLaunch);
    };

    const restorePlayers = (resetLives?: boolean) => {
        const players = Array.from(playersById.values());

        for (const player of players) {
            playersById.set(player.id, {
                ...player,
                emote: null,
                answer: null,
                hiddenAnswer: null,
                lives: resetLives ? 3 : player.lives
            });
        }

        sendPlayers();
    };

    const handlePlayerAnswer = (playerId: string, vote: ChosenAnswer) => {
        const player = playersById.get(playerId);

        if (
            !player ||
            player.lives === 0 ||
            gameState !== GameState.WaitingForAnswers
        )
            return;

        playersById.set(player.id, {
            ...player,
            answer: ChosenAnswer.Answered,
            hiddenAnswer: vote
        });

        sendPlayers();

        if (computeMissingVotes(playersById) === 0) {
            clearTimeout(nextStepTimer);
            endTurn();
        }
    };

    const handlePlayerEmote = (playerId: string, emote: PlayerEmote) => {
        const player = playersById.get(playerId);

        if (
            !player ||
            !(
                gameState === GameState.WaitingForAnswers ||
                gameState === GameState.DisplayScores
            )
        ) {
            return;
        }

        playersById.set(playerId, {
            ...player,
            emote
        });

        sendPlayers();
    };

    const handleRoomReset = (playerId: string) => {
        const player = playersById.get(playerId);

        if (player && player.isRoomMaster && gameState === GameState.Finished) {
            updateGameState(GameState.WaitingForPlayers);
            restorePlayers(true);
        }
    };

    const handleStartGame = (playerId: string) => {
        const player = playersById.get(playerId);
        const players = Array.from(playersById.values());

        if (player && player.isRoomMaster && players.length > 2) {
            launchGame();
        }
    };

    const handleOfflineState = (playerId: string, offline: boolean) => {
        const player = playersById.get(playerId);

        if (player) {
            playersById.set(player.id, {
                ...player,
                offline
            });

            sendPlayers();
        }
    };

    const sendPlayers = () => emitter.emit('players');

    const generateQuestion = () => {
        round += 1;
        restorePlayers();
        generator.generate();
        updateGameState(GameState.WaitingForAnswers);
        emitter.emit('question');
        nextStepTimer = setTimeout(endTurn, timeToAnswer);
    };

    const endTurn = () => {
        const {
            updatedPlayersById,
            playersAlive,
            winningAnswers
        } = computePlayersAlive(playersById);
        playersById = updatedPlayersById;
        lastWinningAnswers = winningAnswers;

        updateGameState(GameState.DisplayScores);
        sendPlayers();

        if (playersAlive > 2) {
            nextStepTimer = setTimeout(generateQuestion, timeToDisplayAnswers);
            return;
        }

        nextStepTimer = setTimeout(endGame, timeToDisplayAnswers);
    };

    const electNewRoomMaster = () => {
        if (!isPrivate) {
            return sendPlayers();
        }

        const { currentRoomMaster, newRoomMaster } = findNewRoomMaster(
            playersById
        );

        if (currentRoomMaster) {
            playersById.set(currentRoomMaster.id, {
                ...currentRoomMaster,
                isRoomMaster: false
            });
        }

        if (newRoomMaster) {
            playersById.set(newRoomMaster.id, {
                ...newRoomMaster,
                isRoomMaster: true
            });
        }

        sendPlayers();
    };

    const endGame = () => {
        restorePlayers();
        electNewRoomMaster();
        updateGameState(GameState.Finished);
    };

    return {
        addPlayer,
        removePlayer,
        handlePlayerAnswer,
        handleStartGame,
        handlePlayerEmote,
        handleRoomReset,
        handleOfflineState,
        emitter,
        generator,
        isPrivate,
        get players() {
            return Array.from(playersById.values());
        },
        get gameState() {
            return gameState;
        },
        get stateStart() {
            return stateStart;
        },
        get duration() {
            return duration;
        },
        get round() {
            return round;
        },
        get lastWinningAnswers() {
            return lastWinningAnswers;
        }
    };
};
