import React from 'react';
import { Player, ChosenAnswer } from '../Engine/Engine';
import './PlayerBox.css';

interface Props {
    player: Player
}

export default function PlayerBox (props: Props) {
    let classNames = 'player';

    // Todo: put it in root
    if (props.player.lives === 0) {
        classNames = 'player dead';
    } else if (props.player.answer === ChosenAnswer.Answered) {
        classNames = 'player answered';
    } else if (props.player.answer === ChosenAnswer.A) {
        classNames = 'player a';
    } else if (props.player.answer === ChosenAnswer.B) {
        classNames = 'player b';
    } else if (props.player.answer === ChosenAnswer.C) {
        classNames = 'player c';
    }

    return <div className={ classNames }>
        <div className="nickname">{ props.player.nickname }</div>
        { props.player.lives }
    </div>
};
