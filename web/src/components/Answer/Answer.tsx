import React, { MouseEvent } from 'react';
import styles from './Answer.module.css';

interface Props {
    letter: string;
    disabled: boolean;
    selected: boolean;
    score?: number;
    answer: string;
    onClick: (event: MouseEvent) => void;
}

export default function Answer({
    letter,
    disabled,
    selected,
    score,
    answer,
    onClick
}: Props) {
    const classToApply = [styles.answer];
    switch (letter) {
        case 'A':
            classToApply.push(styles.a);
            break;
        case 'B':
            classToApply.push(styles.b);
            break;
        case 'C':
            classToApply.push(styles.c);
            break;
        default:
        // do nothing
    }

    if (selected) {
        classToApply.push(styles.selected);
    }

    const classNames = classToApply.join(' ');

    return (
        <button className={classNames} disabled={disabled} onClick={onClick}>
            <div className={styles.letter}>{letter}</div>
            <div className={styles.content}>{answer}</div>
            {score !== null && <div className={styles.score}>{score}</div>}
        </button>
    );
}
