import React from 'react';
import { FaHeart } from 'react-icons/fa';
import { FiWifiOff } from 'react-icons/fi';
import { Player, ChosenAnswer } from '../Engine/Engine';
import './PlayerBox.css';

interface Props {
    player: Player;
}

export default function PlayerBox(props: Props) {
    let classNames = 'player';

    // Todo: put it in root
    if (props.player.answer === ChosenAnswer.Answered) {
        classNames = 'player answered';
    } else if (props.player.answer === ChosenAnswer.A) {
        classNames = 'player a';
    } else if (props.player.answer === ChosenAnswer.B) {
        classNames = 'player b';
    } else if (props.player.answer === ChosenAnswer.C) {
        classNames = 'player c';
    } else if (props.player.lives === 0) {
        classNames = 'player dead';
    }

    const lives: JSX.Element[] = [];

    for (let i = 0; i < props.player.lives; i++) {
        lives.push(
            <FaHeart key={`${props.player.id}_${i}`} className="live" />
        );
    }

    return (
        <div className={classNames}>
            <div className="nickname">{props.player.nickname}</div>
            <div className="icons">
                {props.player.offline && (
                    <div className="offline">
                        <FiWifiOff />
                    </div>
                )}
                <div className="lives">{lives}</div>
            </div>
        </div>
    );
}
