import React, { useState, FormEvent } from 'react';
import { useHistory } from 'react-router-dom';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const history = useHistory();

    const submitLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        localStorage.setItem('nickname', nickname);

        history.push('/play');
    };

    return (
        <div>
            <form onSubmit={submitLogin}>
                <input
                    type="text"
                    name="nickname"
                    placeholder="Pseudo (3 caractères min.)"
                    pattern="\w{3,}"
                    required
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    title="Veuillez utiliser au minimum 3 caractères alphanumériques"
                />
                <input type="submit" value="OK" />
            </form>
        </div>
    );
}
