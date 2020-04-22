import React from 'react';
import styles from './LoggedOut.module.css';

interface Props {
    children: React.ReactNode;
}

export default function LoggedOut({ children }: Props) {
    return (
        <div className="loggedOut">
            <div className={styles.header}>
                <img src="/logo.png" alt="MJRT" width="250" />
            </div>
            <div className={styles.container}>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
