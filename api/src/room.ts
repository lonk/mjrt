import { Room, Client, Delayed } from 'colyseus';
import { State } from './state';

type JoinOptions = {
    nickname: string;
};

const timeBeforeLaunch = 10000;

export class MjrtRoom extends Room<State> {
    delayedLaunchTimer: Delayed | null = null;

    onCreate() {
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

    onMessage(client: Client, message: any) {}

    startGame() {
        this.clock.clear();
        this.lock();
    }
}
