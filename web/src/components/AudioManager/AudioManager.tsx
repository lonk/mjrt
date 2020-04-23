import React, { useEffect, useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { GameState, ServerState, ChosenAnswer } from '../../server/types';
import styles from './AudioManager.module.css';

interface Props {
    serverState: ServerState;
    chosenAnswer: ChosenAnswer | null;
}

const audio = new Audio('/notify.mp3');
const success = new Audio('/success.mp3');
const failure = new Audio('/failure.mp3');

export function AudioManager({ serverState, chosenAnswer }: Props) {
    const [audioActivated, setAudioActivated] = useState(true);

    const doesPlayerWon = () => {
        return (
            chosenAnswer !== null &&
            serverState.lastWinningAnswers.indexOf(chosenAnswer) > -1
        );
    };

    useEffect(() => {
        audio.load();
        success.load();
        failure.load();
    }, []);

    useEffect(() => {
        if (!audioActivated) {
            return;
        }

        switch (serverState.gameState) {
            case GameState.AboutToStart:
                audio.play();
                break;
            case GameState.DisplayScores:
                if (doesPlayerWon()) success.play();
                else failure.play();
                break;
            default:
            // do nothing
        }
    }, [serverState.gameState]);

    return (
        <button
            className={styles.audioManager}
            onClick={() => setAudioActivated(!audioActivated)}
        >
            {audioActivated && <FaVolumeUp />}
            {!audioActivated && <FaVolumeMute />}
        </button>
    );
}
