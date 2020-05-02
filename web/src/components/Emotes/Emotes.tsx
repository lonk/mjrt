import React, { useState, useEffect } from 'react';
import { FaLaughSquint, FaSadTear, FaSadCry, FaSmile } from 'react-icons/fa';
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
                    <button
                        onClick={() => selectEmote(PlayerEmote.Laugh)}
                        className={
                            emote === PlayerEmote.Laugh
                                ? styles.selected
                                : undefined
                        }
                    >
                        <FaLaughSquint />
                    </button>
                    <button
                        onClick={() => selectEmote(PlayerEmote.Smile)}
                        className={
                            emote === PlayerEmote.Smile
                                ? styles.selected
                                : undefined
                        }
                    >
                        <FaSmile />
                    </button>
                    <button
                        onClick={() => selectEmote(PlayerEmote.Sad)}
                        className={
                            emote === PlayerEmote.Sad
                                ? styles.selected
                                : undefined
                        }
                    >
                        <FaSadTear />
                    </button>
                    <button
                        onClick={() => selectEmote(PlayerEmote.Tears)}
                        className={
                            emote === PlayerEmote.Tears
                                ? styles.selected
                                : undefined
                        }
                    >
                        <FaSadCry />
                    </button>
                </div>
            )}
        </div>
    );
}
