import SocketIO from 'socket.io';

export enum ChosenAnswer {
    A,
    B,
    C,
    Answered
}

export interface Player {
    id: string;
    socket: SocketIO.Socket;
    nickname: string;
    lives: number;
    answer: ChosenAnswer | null;
    hiddenAnswer: ChosenAnswer | null;
    offline: boolean;
    isRoomMaster: boolean;
}

export const buildPlayer = (
    socket: SocketIO.Socket,
    id: string,
    nickname: string
): Player => ({
    id,
    socket,
    nickname,
    lives: 3,
    answer: null,
    hiddenAnswer: null,
    offline: false,
    isRoomMaster: false
});

export const reshapePlayer = (player: Player) => ({
    sessionId: player.socket.id,
    nickname: player.nickname,
    lives: player.lives,
    answer: player.answer,
    offline: player.offline,
    isRoomMaster: player.isRoomMaster
});
