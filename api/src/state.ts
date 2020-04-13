import { Schema, MapSchema, ArraySchema, defineTypes } from '@colyseus/schema';
import { Player } from './player';

enum GameState {
    WaitingForPlayers,
    AboutToStart,
    WaitingForAnswers,
    AboutToSendNextQuestion,
    Finished
}

export class State extends Schema {
    gameState = GameState.WaitingForPlayers;
    startTime: number | null = null;
    players = new MapSchema<Player>();
    currentQuestion: string | null = null;
    currentAnswers = new ArraySchema<string>();

    getPlayers() {
        return this.players;
    }

    createPlayer(id: string, nickname: string) {
        this.players[id] = new Player(nickname);
    }

    removePlayer(id: string) {
        delete this.players[id];
    }

    isAboutToStart(startTime: number) {
        this.startTime = startTime;
        this.gameState = GameState.AboutToStart;
    }

    setCurrentQuestion(question: string, answers: string[]) {
        this.currentQuestion = question;
        this.currentAnswers = new ArraySchema<string>(...answers);
        this.gameState = GameState.WaitingForAnswers;
    }
}

defineTypes(State, {
    gameState: "number",
    startTime: "number",
    players: { map: Player },
    currentquestion: "string",
    currentAnswers: ["string"]
});
