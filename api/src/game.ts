import { Player } from "./player";

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
}
