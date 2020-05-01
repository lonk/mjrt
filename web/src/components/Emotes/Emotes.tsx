import React, { useState, useEffect } from 'react';
import { FaLaughSquint, FaSadTear, FaSadCry, FaSmile } from 'react-icons/fa';
import { PlayerEmote, GameState } from '../../server/types';
import styles from './Emotes.module.css';

interface Props {
    gameState: GameState;
    onSelected: (emote: PlayerEmote) => void;
}

export default function Emotes({ gameState, onSelected }: Props) {
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
    return (
        <div className={styles.emotes}>
            <button
                onClick={() => selectEmote(PlayerEmote.Laugh)}
                disabled={emote !== null}
                className={
                    emote === PlayerEmote.Laugh ? styles.selected : undefined
                }
            >
                <FaLaughSquint />
            </button>
            <button
                onClick={() => selectEmote(PlayerEmote.Smile)}
                disabled={emote !== null}
                className={
                    emote === PlayerEmote.Smile ? styles.selected : undefined
                }
            >
                <FaSmile />
            </button>
            <button
                onClick={() => selectEmote(PlayerEmote.Sad)}
                disabled={emote !== null}
                className={
                    emote === PlayerEmote.Sad ? styles.selected : undefined
                }
            >
                <FaSadTear />
            </button>
            <button
                onClick={() => selectEmote(PlayerEmote.Tears)}
                disabled={emote !== null}
                className={
                    emote === PlayerEmote.Tears ? styles.selected : undefined
                }
            >
                <FaSadCry />
            </button>
        </div>
    );
}
