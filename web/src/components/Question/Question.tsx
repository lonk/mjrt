import React, { useState, useEffect } from 'react';
import Answer from '../Answer/Answer';
import { serverClient } from '../../server';
import { GameState, ChosenAnswer, ServerState } from '../../server/types';
import styles from './Question.module.css';

interface Props {
    serverState: ServerState;
    onSelected: (answer: ChosenAnswer) => void;
}

export default function Question({ serverState, onSelected }: Props) {
    const [chosenAnswer, setChosenAnswer] = useState<ChosenAnswer | null>();

    useEffect(() => {
        if (serverState.gameState === GameState.WaitingForAnswers) {
            setChosenAnswer(null);
        }
    }, [serverState.gameState]);

    const selectAnswer = (answer: ChosenAnswer) => {
        if (!canPlayerAnswer()) {
            return;
        }

        setChosenAnswer(answer);
        onSelected(answer);
    };

    const canPlayerAnswer = () => {
        const currentPlayer = serverState.players.find(
            player => player.sessionId === serverClient.id
        );

        return Boolean(
            currentPlayer &&
                currentPlayer.lives > 0 &&
                serverState.gameState === GameState.WaitingForAnswers
        );
    };

    const computeScore = (answer: ChosenAnswer) => {
        if (serverState.gameState !== GameState.DisplayScores) {
            return;
        }

        return serverState.players.filter(player => player.answer === answer)
            .length;
    };

    return (
        <div className={styles.question}>
            <div className={styles.round}>Question {serverState.round}</div>
            <div className={styles.questionText}>{serverState.question}</div>
            <div className={styles.answers}>
                <Answer
                    letter="A"
                    answer={serverState.answers[0]}
                    score={computeScore(ChosenAnswer.A)}
                    selected={chosenAnswer === ChosenAnswer.A}
                    disabled={!canPlayerAnswer()}
                    onClick={() => selectAnswer(ChosenAnswer.A)}
                />
                <Answer
                    letter="B"
                    answer={serverState.answers[1]}
                    score={computeScore(ChosenAnswer.B)}
                    selected={chosenAnswer === ChosenAnswer.B}
                    disabled={!canPlayerAnswer()}
                    onClick={() => selectAnswer(ChosenAnswer.B)}
                />
                <Answer
                    letter="C"
                    answer={serverState.answers[2]}
                    score={computeScore(ChosenAnswer.C)}
                    selected={chosenAnswer === ChosenAnswer.C}
                    disabled={!canPlayerAnswer()}
                    onClick={() => selectAnswer(ChosenAnswer.C)}
                />
            </div>
        </div>
    );
}
