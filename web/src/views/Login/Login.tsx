import React, { useState, FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { generate } from 'shortid';
import { serverClient } from '../../server';
import './Login.css';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const [socketLost, setSocketLost] = useState(false);
    const history = useHistory();

    const submitLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        localStorage.setItem('nickname', nickname);
        if (!localStorage.getItem('playerId')) {
            localStorage.setItem('playerId', generate());
        }

        if (serverClient.disconnected) {
            setSocketLost(true);
            return;
        }

        setSocketLost(false);

        history.push('/play');
    };

    const displaySocketLost = (
        <div className="login-lost">
            Le serveur est injoignable, veuillez ré-essayer plus tard.
        </div>
    );

    return (
        <div className="login">
            <div className="login-mjrt">
                <img src="./logo.png" alt="MJRT" width="250" />
            </div>
            <div className="login-content">
                <div className="login-card">
                    {socketLost && displaySocketLost}
                    Une question, trois réponses.
                    <br />
                    Choisissez comme la majorité pour rester en vie.
                    <br />
                    Combien de tours survivrez-vous ?
                    <form onSubmit={submitLogin} className="login-loginForm">
                        <input
                            type="text"
                            className="login-nickname"
                            name="nickname"
                            placeholder="Pseudo (2-12 caractères )"
                            pattern="\w{2,12}"
                            required
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            title="Veuillez utiliser entre 2 et 12 caractères alphanumériques"
                        />
                        <input
                            type="submit"
                            value="JOUER"
                            className="login-submit"
                        />
                    </form>
                    La partie se lance dix secondes après l'arrivée du cinquième
                    joueur.
                </div>
            </div>
        </div>
    );
}
