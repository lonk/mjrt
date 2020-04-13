import { Schema, MapSchema, ArraySchema, defineTypes } from '@colyseus/schema';
import { Player, ChosenAnswer } from './player';

export enum GameState {
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

    setPlayerChoice(id: string, choice: ChosenAnswer) {
        (this.players[id] as Player).setAnswer(choice);
    }

    displayPlayersAnswer() {
        for (let playerId in this.players) {
            (this.players[playerId] as Player).displayAnswer();
        }
    }

    resetPlayersAnswer() {
        // Todo: refact after PoC
        const votes: Map<ChosenAnswer, number> = new Map();

        for (let playerId in this.players) {
            const player = this.players[playerId] as Player;
            votes.set(player.answer, (votes.get(player.answer) || 0) + 1);
        }

        const winningAnswer = Array.from(votes.entries())
            .sort((left, right) => left[1] - right[0])
            .shift()![0];
        
        for (let playerId in this.players) {
            const player = this.players[playerId] as Player;
            
            if (player.answer !== winningAnswer) {
                player.removeALife();
            }

            player.resetAnswer();
        }
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
        this.resetPlayersAnswer();
    }

    displayScores(nextStepTime: number) {
        this.displayPlayersAnswer();
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
