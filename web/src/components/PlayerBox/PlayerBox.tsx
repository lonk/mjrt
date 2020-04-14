import React from 'react';
import { Player, ChosenAnswer } from '../Engine/Engine';
import './PlayerBox.css';

interface Props {
    player: Player
}

export default function PlayerBox (props: Props) {
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
    } else if (props.player.lives === -1) {
        classNames = 'player dead';
    }

    const lives: JSX.Element[] = [];

    for (let i = 0; i < props.player.lives; i++) {
        lives.push(<span>&#10084;  </span>);
    }

    return <div className={ classNames }>
        <div className="nickname">{ props.player.nickname }</div>
        <div className="lives">{ lives }</div>
    </div>
};
