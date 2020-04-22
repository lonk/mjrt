export enum ChosenAnswer {
    A,
    B,
    C,
    Answered
}

export interface Player {
    id: string;
    nickname: string;
    lives: number;
    answer: ChosenAnswer | null;
    hiddenAnswer: ChosenAnswer | null;
    offline: boolean;
    isRoomMaster: boolean;
}

export const buildPlayer = (
    id: string,
    nickname: string,
    isRoomMaster: boolean
): Player => ({
    id,
    nickname,
    lives: 3,
    answer: null,
    hiddenAnswer: null,
    offline: false,
    isRoomMaster
});

export const reshapePlayer = (player: Player, socket: SocketIO.Socket) => ({
    sessionId: socket.id,
    nickname: player.nickname,
    lives: player.lives,
    answer: player.answer,
    offline: socket.disconnected,
    isRoomMaster: player.isRoomMaster
});
