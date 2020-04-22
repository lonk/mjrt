import React from 'react';
import { FaTwitter, FaDiscord } from 'react-icons/fa';
import Countdown from 'react-countdown';
import styles from './Top.module.css';

export default function Top(props: any) {
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
                {props.children}

                {props.countdown !== null && (
                    <div className={styles.countdown}>
                        <strong>Temps restant :</strong>{' '}
                        <Countdown
                            date={props.countdown}
                            key={props.countdown}
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
