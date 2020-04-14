import React from 'react';
import './Answer.css';

export default function Answer(props: any) {
    let classNames = 'answer';
    switch (props.letter) {
        case 'A':
            classNames = 'answer a';
            break;
        case 'B':
            classNames = 'answer b';
            break;
        case 'C':
            classNames = 'answer c';
            break;
        default:
            classNames = 'answer';
    }

    return (
        <button
            className={classNames}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            <div className="answer-letter">{props.letter}</div>
            <div className="answer-content">{props.answer}</div>
            {props.score !== null && (
                <div className="answer-score">{props.score}</div>
            )}
        </button>
    );
}
