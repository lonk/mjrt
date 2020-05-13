import React from 'react';
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';
import styles from './Icons.module.css';

export default function Icons() {
    return (
        <div className={styles.icons}>
            <a href="https://twitter.com/MjrtNet">
                <FaTwitter />
            </a>
            <a href="https://discord.gg/wqMxG4s">
                <FaDiscord />
            </a>
            <a href="https://github.com/lonk/mjrt">
                <FaGithub />
            </a>
        </div>
    );
}
