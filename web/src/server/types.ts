export enum GameState {
    WaitingForPlayers,
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

export enum PlayerEmote {
    Laugh,
    Smile,
    Surprised,
    Tears
}

export type NumberedAnswer = {
    label: string;
    type: ChosenAnswer;
};

export type Player = {
    sessionId: string;
    nickname: string;
    answer: ChosenAnswer | null;
    lives: number;
    emote: PlayerEmote | null;
    offline: boolean;
    isRoomMaster: boolean;
};

export type GameStateMessage = {
    gameState: GameState;
    duration: number | null;
    isPrivate: boolean;
    round: number;
    lastWinningAnswers: ChosenAnswer[];
    locked: boolean;
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
    answers: NumberedAnswer[];
    players: Player[];
    round: number;
    lastWinningAnswers: ChosenAnswer[];
    locked: boolean;
}
