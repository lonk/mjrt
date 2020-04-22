import React from 'react';
import styles from  './Answer.module.css';

export default function Answer(props: any) {
    const classToApply = [styles.answer];
    switch (props.letter) {
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

    if (props.selected) {
        classToApply.push(styles.selected);
    }

    const classNames = classToApply.join(' ');

    return (
        <button
            className={classNames}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            <div className={styles.letter}>{props.letter}</div>
            <div className={styles.content}>{props.answer}</div>
            {props.score !== null && (
                <div className={styles.score}>{props.score}</div>
            )}
        </button>
    );
}
