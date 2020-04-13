import schema, { Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import { Player } from './player';

import questions from '../database/vox-questions.json';
import answers from '../database/vox-answers.json';

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

    generateQuestion() {
        // To refact after PoC
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        const answersToAdd = [
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)]
        ];

        this.currentAnswers = new ArraySchema<string>(...answersToAdd);
    }
}

schema.defineTypes(State, {
    gameState: "number",
    startTime: "number",
    players: { map: Player },
    currentquestion: "string",
    currentAnswers: ["string"]
});
