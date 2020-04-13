import { Room, Client, Delayed } from 'colyseus';
import { State, GameState } from './state';
import { ChosenAnswer } from './player';

import questions from '../database/vox-questions.json';
import answers from '../database/vox-answers.json';

type JoinOptions = {
    nickname: string;
};

type ClientMessage = {
    vote: ChosenAnswer
};

const asyncTimeout = (clock: any, time: number) =>
    new Promise(resolve => {
        clock.setTimeout(resolve, time);
    });

const timeBeforeLaunch = 10000;
const timeToAnswer = 20000;
const timeToSeeAnswers = 5000;

export class MjrtRoom extends Room<State> {
    delayedLaunchTimer: Delayed | null = null;

    onCreate() {
        this.setState(new State());
        console.log(`Room ${this.roomId} created`);
    }

    onJoin(client: Client, options: JoinOptions) {
        this.state.createPlayer(client.sessionId, options.nickname);

        if (Object.entries(this.state.players).length === 2) {
            this.clock.start();
            this.state.isAboutToStart(
                this.clock.currentTime + timeBeforeLaunch
            );
            
            this.delayedLaunchTimer = this.clock.setTimeout(
                () => this.startGame(),
                timeBeforeLaunch
            );
        }

        if (Object.entries(this.state.players).length === 50) {
            this.delayedLaunchTimer?.clear();
            this.startGame();
        }
    }

    onMessage(client: Client, message: ClientMessage) {
        if (this.state.gameState !== GameState.WaitingForAnswers) {
            return;
        }
        
        this.state.setPlayerChoice(client.sessionId, message.vote)
    }

    startGame() {
        this.clock.clear();
        this.lock();

        this.gameLoop();
    }

    generateQuestion(endTime: number) {
        // To refact after PoC - put it on a separate file
        const answersToAdd = [
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)]
        ];

        this.state.setCurrentQuestion(
            questions[Math.floor(Math.random() * questions.length)],
            answersToAdd,
            endTime
        );
    }

    async gameLoop() {
        const remainingPlayers = Object.entries(this.state.players).filter(
            entry => entry[1].lives > 0
        ).length;

        if (remainingPlayers === 2) {
            this.clock.clear();
            this.state.finishGame();
            return;
        }

        this.clock.start();
        const endTime = this.clock.currentTime + timeToAnswer;
        this.generateQuestion(endTime);
        await asyncTimeout(this.clock, timeToAnswer);

        this.clock.start();
        const seeAnswersTime = this.clock.currentTime + timeToSeeAnswers;
        this.state.displayScores(seeAnswersTime);

        // TODO: remove lives

        await asyncTimeout(this.clock, timeToSeeAnswers);
        this.gameLoop();
    }
}
