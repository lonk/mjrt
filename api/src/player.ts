import schema, { Schema } from '@colyseus/schema';

enum PlayerStatus {
    Waiting,
    Thinking,
    Answered
}

enum ChosenAnswer {
    QuestionA,
    QuestionB,
    QuestionC
}

export class Player extends Schema {
    nickname: string | null = null;
    playerStatus = PlayerStatus.Waiting;
    answer: ChosenAnswer | null = null;
    hiddenAnswer: ChosenAnswer | null = null;

    super(nickname: string) {
        this.nickname = nickname;
    }

    setAnswer(answer: ChosenAnswer) {
        this.hiddenAnswer = answer;
    }

    resetAnswer() {
        this.answer = null;
        this.hiddenAnswer = null;
    }

    displayAnswer() {
        this.answer = this.hiddenAnswer;
    }
}

schema.defineTypes(Player, {
    nickname: "string",
    playerStatus: "number",
    answer: "number"
});
