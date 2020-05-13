import React from 'react';
import Icons from '../../components/Icons/Icons';
import styles from './LoggedOut.module.css';

interface Props {
    children: React.ReactNode;
}

export default function LoggedOut({ children }: Props) {
    return (
        <div className="loggedOut">
            <div className={styles.header}>
                <img src="/logo.png" alt="MJRT" width="250" />
                <Icons />
            </div>
            <div className={styles.container}>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
