import { EventEmitter } from 'events';
import { Player } from './player';

export enum GameState {
    WaitingForPlayers,
    AboutToLock,
    AboutToStart,
    WaitingForAnswers,
    DisplayScores,
    Finished
}

export interface GameRoom {
    handlePlayer: (player: Player) => void;
    roomId: string;
    gameState: GameState;
    nextState: number | null;
    playersById: Map<string, Player>;
    eventEmitter: EventEmitter;
    lastQuestion: {
        question: string;
        answers: string[];
    }
    isPrivate: boolean;
}
