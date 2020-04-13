import { defineTypes, Schema } from '@colyseus/schema';

enum PlayerStatus {
    Waiting,
    Thinking,
    Answered
}

export enum ChosenAnswer {
    QuestionA,
    QuestionB,
    QuestionC,
    Answered,
    None
}

export class Player extends Schema {
    nickname: string = '';
    playerStatus = PlayerStatus.Waiting;
    answer: ChosenAnswer = ChosenAnswer.None;
    hiddenAnswer: ChosenAnswer = ChosenAnswer.None;
    lives: number = 3;

    super(nickname: string) {
        this.nickname = nickname;
    }

    setAnswer(answer: ChosenAnswer) {
        this.hiddenAnswer = answer;
        this.answer = ChosenAnswer.Answered;
    }

    resetAnswer() {
        this.answer = ChosenAnswer.None;
        this.hiddenAnswer = ChosenAnswer.None;
    }

    displayAnswer() {
        this.answer = this.hiddenAnswer;
    }
}

defineTypes(Player, {
    nickname: "string",
    playerStatus: "number",
    answer: "number",
    lives: "number"
});
