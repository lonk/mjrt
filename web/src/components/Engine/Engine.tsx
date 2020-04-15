import React, { useState, useEffect } from 'react';
import { serverClient } from '../../server';
import PlayerBox from '../PlayerBox/PlayerBox';
import Top from '../Top/Top';
import Answer from '../Answer/Answer';

import './Engine.css';

// Todo: put it in root
enum GameState {
    WaitingForPlayers,
    AboutToLock,
    AboutToStart,
    WaitingForAnswers,
    DisplayScores,
    Finished
}

export enum ChosenAnswer {
    A,
    B,
    C,
    Answered
}

export type Player = {
    id: string;
    nickname: string;
    answer: ChosenAnswer | null;
    lives: number;
};

export type GameStateMessage = {
    gameState: GameState;
    nextState?: number;
};

export type CurrentQuestionMessage = {
    question: string;
    answers: string[];
};

export type PlayersMessage = {
    players: Player[];
};

export default function Engine() {
    const [gameState, setGameState] = useState(GameState.WaitingForPlayers);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [currentAnswers, setCurrentAnswers] = useState<string[]>([]);
    const [chosenAnswer, setChosenAnswer] = useState<ChosenAnswer | null>();
    const [players, setPlayers] = useState<Player[]>([]);
    const [countdown, setCountdown] = useState<number | undefined>();

    useEffect(() => {
        serverClient.on(
            'gameState',
            ({ gameState, nextState }: GameStateMessage) => {
                setGameState(gameState);
                setCountdown(nextState);
            }
        );

        serverClient.on(
            'currentQuestion',
            ({ question, answers }: CurrentQuestionMessage) => {
                setChosenAnswer(null);
                setCurrentQuestion(question);
                setCurrentAnswers(answers);
            }
        );

        serverClient.on('players', (message: PlayersMessage) => {
            setPlayers(message.players);
        });

        return () => {
            serverClient.off('gameState');
            serverClient.off('currentQuestion');
            serverClient.off('players');
        };
    }, []);

    const voteAnswer = (vote: ChosenAnswer) => {
        if (gameState === GameState.WaitingForAnswers) {
            setChosenAnswer(vote);
            serverClient.emit('vote', { vote });
        }
    };

    const question = <div className="engine-question">{currentQuestion}</div>;
    const answer = (
        <div className="engine-answers">
            <Answer
                letter="A"
                answer={currentAnswers[0]}
                score={
                    gameState === GameState.DisplayScores &&
                    players.filter(player => player.answer === ChosenAnswer.A)
                        .length
                }
                selected={chosenAnswer === ChosenAnswer.A}
                disabled={gameState !== GameState.WaitingForAnswers}
                onClick={() => voteAnswer(ChosenAnswer.A)}
            />
            <Answer
                letter="B"
                answer={currentAnswers[1]}
                score={
                    gameState === GameState.DisplayScores &&
                    players.filter(player => player.answer === ChosenAnswer.B)
                        .length
                }
                selected={chosenAnswer === ChosenAnswer.B}
                disabled={gameState !== GameState.WaitingForAnswers}
                onClick={() => voteAnswer(ChosenAnswer.B)}
            />
            <Answer
                letter="C"
                answer={currentAnswers[2]}
                score={
                    gameState === GameState.DisplayScores &&
                    players.filter(player => player.answer === ChosenAnswer.C)
                        .length
                }
                selected={chosenAnswer === ChosenAnswer.C}
                disabled={gameState !== GameState.WaitingForAnswers}
                onClick={() => voteAnswer(ChosenAnswer.C)}
            />
        </div>
    );

    const waitingForPlayers = (
        <span>En attente des joueurs (5 joueurs minimum)</span>
    );

    const aboutToLock = <div>En attente des derniers joueurs.</div>;

    const aboutToStart = (
        <div>Les joueurs sont au complet ! La partie va pouvoir commencer.</div>
    );

    const finished = <div>Partie terminée.</div>;

    return (
        <div className="engine">
            <Top countdown={countdown}>
                {gameState === GameState.WaitingForPlayers && waitingForPlayers}
                {gameState === GameState.AboutToLock && aboutToLock}
                {gameState === GameState.AboutToStart && aboutToStart}
                {gameState === GameState.Finished && finished}
                {(gameState === GameState.DisplayScores ||
                    gameState === GameState.WaitingForAnswers) &&
                    question}
                {(gameState === GameState.WaitingForAnswers ||
                    gameState === GameState.DisplayScores) &&
                    answer}
            </Top>
            <div className="players">
                <div className="players-container">
                    {players.map(player => (
                        <PlayerBox key={player.id} player={player} />
                    ))}
                </div>
            </div>
        </div>
    );
}
