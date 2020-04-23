import React, { useEffect, useState } from 'react';
import { GameState, ServerState } from '../../server/types';

interface Props {
    serverState: ServerState;
}

const audio = new Audio('/notify.mp3');
const success = new Audio('/success.mp3');
const failure = new Audio('/failure.mp3');

export function AudioManager({ serverState }: Props) {
    const [audioActivated, setAudioActivated] = useState(true);

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
                success.play();
                break;
            default:
            // do nothing
        }
    }, [serverState.gameState]);

    return <div></div>;
}
