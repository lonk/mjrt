import questionsDb from '../../database/vox-questions.json';
import answersDb from '../../database/vox-answers.json';

export const buildQuestionGenerator = () => {
    let usedQuestions: string[] = [];
    let usedAnswers: string[] = [];
    let question: string;
    let answers: string[];

    const generate = () => {
        if (usedQuestions.length === questionsDb.length) {
            usedQuestions = [question];
        }

        if (usedAnswers.length === answersDb.length) {
            usedAnswers = answers;
        }

        let generatedQuestion: string;
        do {
            generatedQuestion =
                questionsDb[Math.floor(Math.random() * questionsDb.length)];
        } while (usedQuestions.indexOf(generatedQuestion) > -1);
        question = generatedQuestion;
        usedQuestions.push(question);

        const generatedAnswers: string[] = [];
        while (generatedAnswers.length < 3) {
            const generatedAnswer =
                answersDb[Math.floor(Math.random() * answersDb.length)];

            if (
                usedAnswers.concat(generatedAnswers).indexOf(generatedAnswer) === -1
            ) {
                generatedAnswers.push(generatedAnswer);
            }
        }
        answers = generatedAnswers;
        usedAnswers.push(...answers);
    };

    const getLastQuestion = () => {
        return {
            question,
            answers
        };
    };

    return {
        generate,
        get lastQuestion() {
            return getLastQuestion();
        }
    };
};
