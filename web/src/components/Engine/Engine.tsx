import React, { useState, useEffect } from 'react';
import { serverClient } from '../../server';
import PlayerBox from '../PlayerBox/PlayerBox';
import Top from '../Top/Top';
import WaitingForPlayers from '../WaitingForPlayers/WaitingForPlayers';
import Question from '../Question/Question';
import Finished from '../Finished/Finished';
import Notify from '../Notify/Notify';
import {
    GameState,
    ChosenAnswer,
    GameStateMessage,
    CurrentQuestionMessage,
    PlayersMessage,
    ServerState
} from '../../server/types';
import styles from './Engine.module.css';

export default function Engine() {
    const [countdown, setCountdown] = useState<number | null>(null);
    const [chosenAnswer, setChosenAnswer] = useState<ChosenAnswer | null>(null);
    const [serverState, setServerState] = useState<ServerState>({
        gameState: GameState.WaitingForPlayers,
        isPrivate: false,
        question: null,
        answers: [],
        players: [],
        round: 0,
        lastWinningAnswers: []
    });

    const updateServerState = (updatedFields: Partial<ServerState>) =>
        setServerState(currentServerState => ({
            ...currentServerState,
            ...updatedFields
        }));

    useEffect(() => {
        serverClient.on(
            'gameState',
            ({
                gameState,
                duration,
                round,
                isPrivate,
                lastWinningAnswers
            }: GameStateMessage) => {
                updateServerState({
                    gameState,
                    round,
                    isPrivate,
                    lastWinningAnswers
                });
                setCountdown(duration ? Date.now() + duration : null);
            }
        );

        serverClient.on(
            'currentQuestion',
            ({ question, answers }: CurrentQuestionMessage) => {
                let randomAnswers = [
                    {label: answers[0], type: ChosenAnswer.A},
                    {label: answers[1], type: ChosenAnswer.B},
                    {label: answers[2], type: ChosenAnswer.C}
                ];

                // shuffling answers order
                for (let i = randomAnswers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const x = randomAnswers[i];
                    randomAnswers[i] = randomAnswers[j];
                    randomAnswers[j] = x;
                }

                updateServerState({ question, answers: randomAnswers });
            }
        );

        serverClient.on('players', ({ players }: PlayersMessage) => {
            updateServerState({ players });
        });

        serverClient.emit('getState');

        return () => {
            serverClient.off('gameState');
            serverClient.off('currentQuestion');
            serverClient.off('players');
        };
    }, []);

    const voteAnswer = (vote: ChosenAnswer | null) => {
        setChosenAnswer(vote);
        if (vote !== null) serverClient.emit('vote', { vote });
    };

    const startGame = () => {
        serverClient.emit('startGame');
    };

    const resetRoom = () => {
        serverClient.emit('resetRoom');
    };

    const aboutToLock = (
        <div className={styles.simpleText}>
            En attente des derniers joueurs.
        </div>
    );

    const aboutToStart = (
        <div className={styles.simpleText}>
            Les joueurs sont au complet ! La partie va pouvoir commencer.
        </div>
    );

    return (
        <div className={styles.engine}>
            <Top countdown={countdown} serverState={serverState} chosenAnswer={chosenAnswer}>
                {serverState.gameState === GameState.WaitingForPlayers && (
                    <WaitingForPlayers
                        serverState={serverState}
                        onStart={startGame}
                    />
                )}
                {serverState.gameState === GameState.AboutToLock && aboutToLock}
                {serverState.gameState === GameState.AboutToStart &&
                    aboutToStart}
                {serverState.gameState === GameState.Finished && (
                    <Finished serverState={serverState} onRestart={resetRoom} />
                )}
                {(serverState.gameState === GameState.DisplayScores ||
                    serverState.gameState === GameState.WaitingForAnswers) && (
                    <Question
                        serverState={serverState}
                        onSelected={voteAnswer}
                        chosenAnswer={chosenAnswer}
                    />
                )}
            </Top>
            <div className={styles.players}>
                <div className={styles.playersContainer}>
                    {serverState.players.map(player => (
                        <PlayerBox key={player.sessionId} player={player} />
                    ))}
                </div>
            </div>
            <Notify gameState={serverState.gameState} />
        </div>
    );
}
