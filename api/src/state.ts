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
    nextStepTime: number = 0;
    players = new MapSchema<Player>();
    currentQuestion: string = '';
    currentAnswers = new ArraySchema<string>();

    createPlayer(id: string, nickname: string) {
        this.players[id] = new Player(nickname);
    }

    removePlayer(id: string) {
        delete this.players[id];
    }

    isAboutToStart(nextStepTime: number) {
        this.nextStepTime = nextStepTime;
        this.gameState = GameState.AboutToStart;
    }

    setCurrentQuestion(
        question: string,
        answers: string[],
        nextStepTime: number
    ) {
        this.currentQuestion = question;
        this.currentAnswers = new ArraySchema<string>(...answers);
        this.gameState = GameState.WaitingForAnswers;
        this.nextStepTime = nextStepTime;
    }

    displayScores(nextStepTime: number) {
        this.gameState = GameState.AboutToSendNextQuestion;
        this.nextStepTime = nextStepTime;
    }

    finishGame() {
        this.gameState = GameState.Finished;
    }
}

defineTypes(State, {
    gameState: 'number',
    nextStepTime: 'number',
    players: { map: Player },
    currentQuestion: 'string',
    currentAnswers: ['string']
});
