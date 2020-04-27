import { ChosenAnswer } from '../../server/types';

export const randomizeAnswers = (answers: string[]) => {
    const randomAnswers = [
        { label: answers[0], type: ChosenAnswer.A },
        { label: answers[1], type: ChosenAnswer.B },
        { label: answers[2], type: ChosenAnswer.C }
    ];

    // shuffling answers order
    for (let i = randomAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = randomAnswers[i];
        randomAnswers[i] = randomAnswers[j];
        randomAnswers[j] = x;
    }

    return randomAnswers;
};
