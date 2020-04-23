import React from 'react';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import Countdown from 'react-countdown';
import { AudioManager } from '../AudioManager/AudioManager';
import { ServerState } from '../../server/types';
import styles from './Top.module.css';

interface Props {
    serverState: ServerState;
    children: React.ReactNode;
    countdown: number;
}

export default function Top({ children, serverState, countdown }: Props) {
    return (
        <div className={styles.top}>
            <div className={styles.logo}>
                <img src="/logo.png" alt="MJRT" width="150" />
                <div className={styles.icons}>
                    <a href="https://twitter.com/MjrtNet">
                        <FaTwitter className={styles.icon} />
                    </a>
                    <a href="https://discord.gg/wqMxG4s">
                        <FaDiscord className={styles.icon} />
                    </a>
                </div>
            </div>
            <div className={styles.content}>
                <AudioManager serverState={serverState} />
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
