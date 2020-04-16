import React, { useState, useEffect } from 'react';
import { serverClient } from '../../server';
import PlayerBox from '../PlayerBox/PlayerBox';
import Top from '../Top/Top';
import Answer from '../Answer/Answer';
import Notify from '../Notify/Notify';

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
    offline: boolean;
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

        serverClient.emit('getState');

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

    const isCurrentPlayerAlive = () => {
        const currentPlayer = players.find(
            player => player.id === localStorage.getItem('playerId')
        );

        return Boolean(currentPlayer && currentPlayer.lives > 0);
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
                disabled={
                    gameState !== GameState.WaitingForAnswers ||
                    !isCurrentPlayerAlive()
                }
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
                disabled={
                    gameState !== GameState.WaitingForAnswers ||
                    !isCurrentPlayerAlive()
                }
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
                disabled={
                    gameState !== GameState.WaitingForAnswers ||
                    !isCurrentPlayerAlive()
                }
                onClick={() => voteAnswer(ChosenAnswer.C)}
            />
        </div>
    );

    const waitingForPlayers = (
        <div className="engine-between">
            En attente de 5 joueurs.
            <br /> Pas la peine de rester scotchés à votre écran: nous vous
            enverrons une notification quand la partie sera sur le point de
            commencer !
        </div>
    );

    const aboutToLock = (
        <div className="engine-between">En attente des derniers joueurs.</div>
    );

    const aboutToStart = (
        <div className="engine-between">
            Les joueurs sont au complet ! La partie va pouvoir commencer.
        </div>
    );

    const generateWinners = () => {
        const winners = players.filter(player => player.lives > 0);

        if (winners.length === 0) {
            return <span>Il n'y a eu aucun gagnant.</span>;
        } else if (winners.length === 1) {
            return (
                <span>
                    Notre grand gagnant est{' '}
                    <strong>{winners[0].nickname}</strong> ! Un grand bravo à
                    lui !
                </span>
            );
        } else if (winners.length === 2) {
            return (
                <span>
                    On applaudit <strong>{winners[0].nickname}</strong> et{' '}
                    <strong>{winners[1].nickname}</strong> pour cette partie
                    exemplaire !
                </span>
            );
        }

        return <span></span>;
    };

    const finished = (
        <div>
            Partie terminée, rechargez la page pour rejouer !<br />
            {generateWinners()}
        </div>
    );

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
            <Notify notify={gameState === GameState.AboutToStart} />
        </div>
    );
}
