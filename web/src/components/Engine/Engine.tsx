import React, { useState } from 'react';
import { serverClient } from '../../server';
import PlayerBox from '../PlayerBox/PlayerBox';
import './Engine.css';

// Todo: put it in root
enum GameState {
    WaitingForPlayers,
    AboutToStart,
    WaitingForAnswers,
    AboutToSendNextQuestion,
    Finished
}

export enum PlayerStatus {
    Waiting,
    Thinking,
    Answered
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
};

export type CurrentQuestionMessage = {
    question: string;
    answers: string[];
};

export type PlayersMessage = {
    players: Player[];
};

export type PlayerVoteMessage = {
    id: string;
    vote: ChosenAnswer | null;
};

export default function Engine() {
    const [gameState, setGameState] = useState(GameState.WaitingForPlayers);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [currentAnswers, setCurrentAnswers] = useState<string[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);

    serverClient.on('gameState', ({ gameState }: GameStateMessage) => {
        setGameState(gameState);
    });

    serverClient.on(
        'currentQuestion',
        ({ question, answers }: CurrentQuestionMessage) => {
            setCurrentQuestion(question);
            setCurrentAnswers(answers);
        }
    );

    serverClient.on('players', (message: PlayersMessage) => {
        setPlayers(message.players);
    });

    const voteAnswer = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        vote: ChosenAnswer
    ) => {
        event.preventDefault();
        serverClient.emit('vote', { vote });
    };

    const question = (
        <div>
            <strong>Question:</strong> {currentQuestion}
            <br />
        </div>
    );
    const answer = (
        <div>
            <strong>Réponses:</strong>
            <br />
            <button onClick={e => voteAnswer(e, ChosenAnswer.A)}>
                A. {currentAnswers[0]}
            </button>
            <br />
            <button onClick={e => voteAnswer(e, ChosenAnswer.B)}>
                B. {currentAnswers[1]}
            </button>
            <br />
            <button onClick={e => voteAnswer(e, ChosenAnswer.C)}>
                C. {currentAnswers[2]}
            </button>
        </div>
    );

    const waitingForPlayers = (
        <div>En attente des joueurs (3 joueurs minimum)</div>
    );

    return (
        <div className="engine">
            {gameState === GameState.WaitingForPlayers && waitingForPlayers}
            {currentQuestion && question}
            {currentAnswers.length > 0 && answer}
            <strong>Joueurs:</strong>
            <br />
            <div className="players">
                {players.map((player) => (
                    <PlayerBox key={player.id} player={player} />
                ))}
            </div>
        </div>
    );
}
