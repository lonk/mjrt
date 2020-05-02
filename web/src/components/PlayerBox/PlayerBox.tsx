import React from 'react';
import {
    FaHeart,
    FaCrown,
    FaLaughSquint,
    FaSadTear,
    FaSadCry,
    FaSmile
} from 'react-icons/fa';
import { FiWifiOff } from 'react-icons/fi';
import {
    Player,
    ChosenAnswer,
    ServerState,
    PlayerEmote
} from '../../server/types';
import styles from './PlayerBox.module.css';

interface Props {
    player: Player;
    serverState: ServerState;
}

export default function PlayerBox({ player, serverState }: Props) {
    const classToApply = [styles.player];
    const answerIndex = serverState.answers.findIndex(
        answer => player.answer === answer.type
    );

    switch (answerIndex) {
        case 0:
            classToApply.push(styles.a);
            break;
        case 1:
            classToApply.push(styles.b);
            break;
        case 2:
            classToApply.push(styles.c);
            break;
        case -1:
            if (player.answer === ChosenAnswer.Answered)
                classToApply.push(styles.answered);
            else if (player.lives === 0) classToApply.push(styles.dead);
            break;
        default:
        // do nothing
    }

    const classNames = classToApply.join(' ');
    const lives: JSX.Element[] = [];

    for (let i = 0; i < player.lives; i++) {
        lives.push(
            <FaHeart key={`${player.sessionId}_${i}`} className={styles.live} />
        );
    }

    let emote: JSX.Element | null;
    switch (player.emote) {
        case PlayerEmote.Laugh:
            emote = <FaLaughSquint />;
            break;
        case PlayerEmote.Sad:
            emote = <FaSadTear />;
            break;
        case PlayerEmote.Tears:
            emote = <FaSadCry />;
            break;
        case PlayerEmote.Smile:
            emote = <FaSmile />;
            break;
        default:
            emote = null;
    }

    return (
        <div className={classNames}>
            <div className={styles.nickname}>{player.nickname}</div>
            <div className={styles.icons}>
                {player.emote !== null && (
                    <div className={styles.master}>{emote}</div>
                )}
                {player.emote === null && player.isRoomMaster && (
                    <div className={styles.master}>
                        <FaCrown />
                    </div>
                )}
                {player.offline && (
                    <div className={styles.offline}>
                        <FiWifiOff />
                    </div>
                )}
                <div className={styles.lives}>{lives}</div>
            </div>
        </div>
    );
}
