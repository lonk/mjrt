import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { generate } from 'shortid';
import { serverClient } from '../../server';
import styles from './Login.module.css';
import LoginForm from '../../components/LoginForm/LoginForm';
import LoggedOut from '../../layouts/LoggedOut/LoggedOut';

export default function Login() {
    const [socketLost, setSocketLost] = useState(false);

    const history = useHistory();
    const { id } = useParams();

    const handleSubmit = (nickname: string, createPrivate: boolean) => {
        localStorage.setItem('nickname', nickname);
        if (!localStorage.getItem('playerId')) {
            localStorage.setItem('playerId', generate());
        }

        if (serverClient.disconnected) {
            setSocketLost(true);
            return;
        }

        setSocketLost(false);

        if (createPrivate) {
            history.push(`/play/${generate()}`);
            return;
        } else if (id) {
            history.push(`/play/${id}`);
            return;
        }

        history.push('/play');
    };

    const displaySocketLost = (
        <div className={styles.lost}>
            Le serveur est injoignable, veuillez ré-essayer plus tard.
        </div>
    );

    const privateRoom = (
        <div className={styles.private}>
            <strong>Attention</strong>
            <br />
            Vous allez rejoindre une partie privée !
        </div>
    );

    return (
        <LoggedOut>
            {socketLost && displaySocketLost}
            {Boolean(id) && !socketLost && privateRoom}
            Une question, trois réponses insensées.
            <br />
            Choisissez comme la majorité pour rester en vie.
            <br />
            Combien de tours survivrez-vous ?
            <LoginForm
                onSubmit={handleSubmit}
                allowPrivateCreation={Boolean(id)}
            />
        </LoggedOut>
    );
}
