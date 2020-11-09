import React from 'react';
import Countdown from 'react-countdown';
import { FaLock, FaUnlock } from 'react-icons/fa';
import Icons from '../Icons/Icons';
import AudioManager from '../AudioManager/AudioManager';
import { ServerState, ChosenAnswer } from '../../server/types';
import { serverClient } from '../../server';
import styles from './Top.module.css';

interface Props {
    serverState: ServerState;
    children: React.ReactNode;
    countdown: number | null;
    chosenAnswer: ChosenAnswer | null;
    onToggleLock: () => void;
}

export default function Top({
    children,
    serverState,
    countdown,
    chosenAnswer,
    onToggleLock
}: Props) {
    const isPlayerRoomMaster = () => {
        const player = serverState.players.find(
            player => player.sessionId === serverClient.id
        );

        return player && player.isRoomMaster;
    };

    return (
        <div className={styles.top}>
            <AudioManager
                serverState={serverState}
                chosenAnswer={chosenAnswer}
            />
            {serverState.isPrivate && isPlayerRoomMaster() && (
                <button className={styles.lock} onClick={onToggleLock}>
                    {serverState.locked && <FaLock />}
                    {!serverState.locked && <FaUnlock />}
                </button>
            )}
            <div className={styles.logo}>
                <img src="/logo.png" alt="MJRT" width="150" />
                <Icons />
            </div>
            <div className={styles.content}>
                {children}

                {countdown !== null && (
                    <div className={styles.countdown}>
                        <strong>Temps restant :</strong>{' '}
                        <Countdown
                            date={countdown}
                            key={countdown}
                            renderer={({ seconds }) =>
                                seconds > 1
                                    ? `${seconds} secondes`
                                    : `${seconds} seconde `
                            }
                        />
                    </div>
                )}
            </div>
            <div className={styles.logo}></div>
        </div>
    );
}
