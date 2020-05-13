import React, { useEffect, useState } from 'react';
import { FaHeart, FaCrown } from 'react-icons/fa';
import { FiWifiOff } from 'react-icons/fi';
import {
    Player,
    ChosenAnswer,
    ServerState,
    PlayerEmote
} from '../../server/types';
import { ReactComponent as Tears } from '../../svg/Tears.svg';
import { ReactComponent as Smile } from '../../svg/Smile.svg';
import { ReactComponent as Laugh } from '../../svg/Laugh.svg';
import { ReactComponent as Surprised } from '../../svg/Surprised.svg';
import styles from './PlayerBox.module.css';

interface Props {
    player: Player;
    serverState: ServerState;
}

export default function PlayerBox({ player, serverState }: Props) {
    const [isEmoteFullScreen, setisEmoteFullScreen] = useState(false);
    const classToApply = [styles.player];
    const answerIndex = serverState.answers.findIndex(
        answer => player.answer === answer.type
    );

    useEffect(() => {
        setisEmoteFullScreen(player.emote !== null);
        if (player.emote !== null) {
            setTimeout(() => {
                setisEmoteFullScreen(false);
            }, 2000);
        }
    }, [player.emote]);

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
            emote = <Laugh />;
            break;
        case PlayerEmote.Surprised:
            emote = <Surprised />;
            break;
        case PlayerEmote.Tears:
            emote = <Tears />;
            break;
        case PlayerEmote.Smile:
            emote = <Smile />;
            break;
        default:
            emote = null;
    }

    return (
        <div className={classNames}>
            {!isEmoteFullScreen && (
                <>
                    <div className={styles.nickname}>{player.nickname}</div>
                    <div className={styles.icons}>
                        {player.emote !== null && (
                            <div className={styles.emote}>{emote}</div>
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
                </>
            )}
            {isEmoteFullScreen && emote}
        </div>
    );
}
