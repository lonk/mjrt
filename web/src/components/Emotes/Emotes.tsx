import React, { useState, useEffect } from 'react';
import { ReactComponent as Tears } from '../../svg/Tears.svg';
import { ReactComponent as Smile } from '../../svg/Smile.svg';
import { ReactComponent as Laugh } from '../../svg/Laugh.svg';
import { ReactComponent as Surprised } from '../../svg/Surprised.svg';
import { PlayerEmote, GameState, ChosenAnswer } from '../../server/types';
import styles from './Emotes.module.css';

interface Props {
    gameState: GameState;
    chosenAnswer: ChosenAnswer | null;
    onSelected: (emote: PlayerEmote) => void;
}

export default function Emotes({ gameState, chosenAnswer, onSelected }: Props) {
    const [emote, setEmote] = useState<PlayerEmote | null>(null);

    useEffect(() => {
        if (gameState === GameState.WaitingForAnswers) {
            setEmote(null);
        }
    }, [gameState]);

    const selectEmote = (emote: PlayerEmote) => {
        onSelected(emote);
        setEmote(emote);
    };

    const displayEmotes = chosenAnswer !== null && emote === null;

    return (
        <div className={styles.container}>
            {displayEmotes && (
                <div className={styles.emotes}>
                    <button onClick={() => selectEmote(PlayerEmote.Laugh)}>
                        <Laugh />
                    </button>
                    <button onClick={() => selectEmote(PlayerEmote.Smile)}>
                        <Smile />
                    </button>
                    <button onClick={() => selectEmote(PlayerEmote.Surprised)}>
                        <Surprised />
                    </button>
                    <button onClick={() => selectEmote(PlayerEmote.Tears)}>
                        <Tears />
                    </button>
                </div>
            )}
        </div>
    );
}
