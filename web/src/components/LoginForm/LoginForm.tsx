import React, { useState, FormEvent } from 'react';
import styles from './LoginForm.module.css';

interface Props {
    allowPrivateCreation: boolean;
    onSubmit: (nickname: string, createPrivate: boolean) => void;
}

export default function LoginForm({ allowPrivateCreation, onSubmit }: Props) {
    const [nickname, setNickname] = useState('');
    const [createPrivate, setCreatePrivate] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(nickname, createPrivate);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.nicknameContainer}>
                <input
                    type="text"
                    className={styles.nickname}
                    name="nickname"
                    placeholder="Pseudo (2-12 caractères)"
                    pattern="\w{2,12}"
                    required
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    title="Veuillez utiliser entre 2 et 12 caractères alphanumériques"
                />
                <input
                    type="submit"
                    value="JOUER !"
                    className={styles.submit}
                />
            </div>

            {Boolean(allowPrivateCreation) && (
                <div className={styles.privateBox}>
                    <input
                        type="checkbox"
                        id="private"
                        checked={createPrivate}
                        onChange={e => setCreatePrivate(!createPrivate)}
                    />
                    <label htmlFor="private">Créer une partie privée</label>
                </div>
            )}
        </form>
    );
}
