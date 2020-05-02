export enum ChosenAnswer {
    A,
    B,
    C,
    Answered
}

export enum PlayerEmote {
    Laugh,
    Smile,
    Sad,
    Tears
}

export interface Player {
    id: string;
    nickname: string;
    lives: number;
    emote: PlayerEmote | null;
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
    emote: null,
    answer: null,
    hiddenAnswer: null,
    offline: false,
    isRoomMaster
});

export const reshapePlayer = (player: Player, socket: SocketIO.Socket) => ({
    sessionId: socket.id,
    nickname: player.nickname,
    lives: player.lives,
    emote: player.emote,
    answer: player.answer,
    offline: socket.disconnected,
    isRoomMaster: player.isRoomMaster
});
