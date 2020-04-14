import React, { useState, FormEvent } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const history = useHistory();

    const submitLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        localStorage.setItem('nickname', nickname);

        history.push('/play');
    };

    return (
        <div className="login">
            <div className="login-mjrt">
                <img src="./logo.png" alt="MJRT" width="250" />
            </div>
            <div className="login-content">
                <strong>Bienvenue sur Mjrt</strong>
                <ul className="login-list">
                    <li>Une question, trois réponses</li>
                    <li>Deux vies</li>
                    <li>Votez comme la majorité</li>
                    <li>Soyez le dernier survivant</li>
                </ul>
                La partie se lance dix secondes après l'arrivée du cinquième joueur.
                <form onSubmit={submitLogin} className="login-loginForm">
                    <input
                        type="text"
                        className="login-nickname"
                        name="nickname"
                        placeholder="Pseudo (3 caractères min.)"
                        pattern="\w{3,}"
                        required
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        title="Veuillez utiliser au minimum 3 caractères alphanumériques"
                    />
                    <input type="submit" value="OK" className="login-submit" />
                </form>
            </div>
        </div>
    );
}
