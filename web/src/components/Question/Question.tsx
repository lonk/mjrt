import React, { useState, useEffect } from 'react';
import Answer from '../Answer/Answer';
import { serverClient } from '../../server';
import { GameState, ChosenAnswer, ServerState } from '../../server/types';
import styles from './Question.module.css';

interface Props {
    serverState: ServerState;
    chosenAnswer: ChosenAnswer | null;
    onSelected: (answer: ChosenAnswer | null) => void;
}

export default function Question({
    serverState,
    onSelected,
    chosenAnswer
}: Props) {
    useEffect(() => {
        if (serverState.gameState === GameState.WaitingForAnswers) {
            onSelected(null);
        }
    }, [serverState.gameState]);

    const selectAnswer = (answer: ChosenAnswer) => {
        if (!canPlayerAnswer()) {
            return;
        }

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

    const letters = ["A", "B", "C"];
    let numberLetter = 0;

    return (
        <div className={styles.question}>
            <div className={styles.round}>Question {serverState.round}</div>
            <div className={styles.questionText}>{serverState.question}</div>
            <div className={styles.answers}>
                {serverState.answers.map(answer => (
                    <Answer
                        letter={letters[numberLetter++]}
                        answer={answer.label}
                        score={computeScore(answer.type)}
                        selected={chosenAnswer === answer.type}
                        disabled={!canPlayerAnswer()}
                        onClick={() => selectAnswer(answer.type)}
                    />
                ))}
            </div>
        </div>
    );
}
