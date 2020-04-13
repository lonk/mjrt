import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { serverClient } from '../../server';

enum ServerState {
    Connecting,
    Connected,
    Error
}

export default function Play() {
    const history = useHistory();
    const [nickname, setNickname] = useState(localStorage.getItem('nickname'));
    const [serverStatus, setServerStatus] = useState(ServerState.Connecting);

    const joinServer = async () => {
        try {
            await serverClient.joinOrCreate('game', { nickname });
        } catch {
            return setServerStatus(ServerState.Error);
        }

        setServerStatus(ServerState.Connected);
    };

    useEffect(() => {
        if (!nickname) {
            history.push('/');
            return;
        }

        joinServer();
    }, []);

    const connecting = <div>Connexion au serveur en cours...</div>;
    const error = <div>Connexion au serveur impossible.</div>;
    const success = <div>Connecté au serveur</div>;

    if (serverStatus === ServerState.Error) {
        return error;
    } else if (serverStatus === ServerState.Connecting) {
        return connecting;
    }

    return success;
}
