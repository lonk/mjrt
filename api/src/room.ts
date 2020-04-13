import { Room, Client, Delayed } from 'colyseus';
import { State } from './state';

import questions from '../database/vox-questions.json';
import answers from '../database/vox-answers.json';

type JoinOptions = {
    nickname: string;
};

const timeBeforeLaunch = 10000;

export class MjrtRoom extends Room<State> {
    delayedLaunchTimer: Delayed | null = null;

    onCreate() {
        this.setState(new State());
        console.log(`Room ${this.roomId} created`);
    }

    onJoin(client: Client, options: JoinOptions) {
        this.state.createPlayer(client.sessionId, options.nickname);

        if (this.state.players.length === 15) {
            this.clock.start();
            this.state.isAboutToStart(
                this.clock.currentTime + timeBeforeLaunch
            );
            this.delayedLaunchTimer = this.clock.setTimeout(
                () => this.startGame,
                timeBeforeLaunch
            );
        }

        if (this.state.players.length === 50) {
            this.delayedLaunchTimer?.clear();
            this.startGame();
        }
    }

    onMessage(client: Client, message: any) {
    }

    startGame() {
        this.clock.clear();
        this.lock();

        this.gameLoop();
    }

    generateQuestion() {
        // To refact after PoC - put it on a separate file
        const answersToAdd = [
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)],
            answers[Math.floor(Math.random() * answers.length)]
        ];

        this.state.setCurrentQuestion(
            questions[Math.floor(Math.random() * questions.length)],
            answersToAdd
        );
    }

    gameLoop() {
        const remainingPlayers = Object.entries(this.state.getPlayers()).filter(entry => entry[1].getLives() > 0).length;
        if (remainingPlayers === 2) {
            return;
        }

        this.generateQuestion();

        setTimeout(this.gameLoop, 10000);
    }
}
