export enum GameState {
    WaitingForPlayers,
    AboutToLock,
    AboutToStart,
    WaitingForAnswers,
    DisplayScores,
    Finished
}

export enum ChosenAnswer {
    A,
    B,
    C,
    Answered
}

export type Player = {
    sessionId: string;
    nickname: string;
    answer: ChosenAnswer | null;
    lives: number;
    offline: boolean;
    isRoomMaster: boolean;
};

export type GameStateMessage = {
    gameState: GameState;
    duration: number | null;
    isPrivate: boolean;
    round: number;
    lastWinningAnswers: ChosenAnswer[];
};

export type CurrentQuestionMessage = {
    question: string;
    answers: string[];
};

export type PlayersMessage = {
    players: Player[];
};

export enum SocketState {
    Connecting,
    Connected,
    Disconnected
}

export enum RegisterState {
    Pending,
    Registered,
    AlreadyConnected,
    RoomLocked
}

type RegisteredPayload = {
    code: RegisterState.Registered;
    roomId: string;
};

type ErrorPayload = {
    code: RegisterState.AlreadyConnected | RegisterState.RoomLocked;
};

export type RegistrationPayload = RegisteredPayload | ErrorPayload;

export interface ServerState {
    gameState: GameState;
    isPrivate: boolean;
    question: string | null;
    answers: string[];
    players: Player[];
    round: number;
    lastWinningAnswers: ChosenAnswer[];
}
