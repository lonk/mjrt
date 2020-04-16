import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { serverClient } from '../../server';
import Engine from '../../components/Engine/Engine';
import './Play.css';

enum SocketState {
    Connecting,
    Connected,
    Disconnected
}

export default function Play() {
    const history = useHistory();
    const [socketState, setSocketState] = useState(SocketState.Connecting);

    const checkSocketState = () => {
        if (serverClient.disconnected) {
            setSocketState(SocketState.Disconnected);
            return;
        }

        const nickname = localStorage.getItem('nickname');
        const playerId = localStorage.getItem('playerId');

        serverClient.emit('register', { nickname, playerId });

        serverClient.on('registered', () => {
            setSocketState(SocketState.Connected);
        });
    };

    useEffect(() => {
        const nickname = localStorage.getItem('nickname');
        const playerId = localStorage.getItem('playerId');

        if (!nickname || !playerId) {
            history.push('/');
            return;
        }

        checkSocketState();
    }, []);

    serverClient.on('connect', checkSocketState);
    serverClient.on('disconnect', checkSocketState);

    if (socketState !== SocketState.Connected) {
        return (
            <div className="play">
                <div className="play-mjrt">
                    <img src="./logo.png" alt="MJRT" width="250" />
                </div>
                <div className="play-content">
                    <div className="play-card">
                        {socketState === SocketState.Connecting && (
                            <span>Chargement de la salle en cours...</span>
                        )}
                        {socketState === SocketState.Disconnected && (
                            <span>
                                La connection au serveur a été perdue.
                                <br />
                                Tentative de reconnexion en cours...
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return <Engine />;
}
