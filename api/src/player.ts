import SocketIO from 'socket.io';

export enum ChosenAnswer {
    A,
    B,
    C,
    Answered
}

export interface Player {
    socket: SocketIO.Socket;
    nickname: string;
    lives: number;
    answer: ChosenAnswer | null;
    hiddenAnswer: ChosenAnswer | null;
    roomId: string;
}

export const buildPlayer = (socket: SocketIO.Socket, nickname: string, roomId: string): Player => ({
    socket,
    nickname,
    lives: 2,
    answer: null,
    hiddenAnswer: null,
    roomId
});

export const reshapePlayer = (player: Player) => ({
    id: player.socket.id,
    nickname: player.nickname,
    lives: player.lives,
    answer: player.answer
});
