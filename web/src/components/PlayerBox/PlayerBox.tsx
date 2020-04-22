import React from 'react';
import { FaHeart, FaCrown } from 'react-icons/fa';
import { FiWifiOff } from 'react-icons/fi';
import { Player, ChosenAnswer } from '../Engine/Engine';
import styles from './PlayerBox.module.css';

interface Props {
    player: Player;
}

export default function PlayerBox(props: Props) {
    const classToApply = [styles.player];
    switch (props.player.answer) {
        case ChosenAnswer.A:
            classToApply.push(styles.a);
            break;
        case ChosenAnswer.B:
            classToApply.push(styles.b);
            break;
        case ChosenAnswer.C:
            classToApply.push(styles.c);
            break;
        default:
            // do nothing
    }
    
    if (props.player.lives === 0) {
        classToApply.push(styles.dead);
    }

    const classNames = classToApply.join(' ');
    const lives: JSX.Element[] = [];

    for (let i = 0; i < props.player.lives; i++) {
        lives.push(
            <FaHeart key={`${props.player.sessionId}_${i}`} className="live" />
        );
    }

    return (
        <div className={classNames}>
            <div className={styles.nickname}>{props.player.nickname}</div>
            <div className={styles.icons}>
                {props.player.isRoomMaster && (
                    <div className={styles.master}>
                        <FaCrown />
                    </div>
                )}
                {props.player.offline && (
                    <div className={styles.offline}>
                        <FiWifiOff />
                    </div>
                )}
                <div className={styles.lives}>{lives}</div>
            </div>
        </div>
    );
}
