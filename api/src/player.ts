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
}

export const buildPlayer = (socket: SocketIO.Socket, nickname: string): Player => ({
    socket,
    nickname,
    lives: 3,
    answer: null,
    hiddenAnswer: null
});

export const reshapePlayer = (player: Player) => ({
    id: player.socket.id,
    nickname: player.nickname,
    lives: player.lives,
    answer: player.answer
});
