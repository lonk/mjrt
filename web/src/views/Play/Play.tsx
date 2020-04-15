import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { serverClient } from '../../server';
import Engine from '../../components/Engine/Engine';

export default function Play() {
    const history = useHistory();
    const [nickname] = useState(localStorage.getItem('nickname'));
    const [socketLost, setSocketLost] = useState(false);

    const checkSocketState = () => {
        if (serverClient.disconnected) {
            setSocketLost(true);
            return;
        }

        serverClient.emit('setNickname', { nickname });
        setSocketLost(false);
    };

    useEffect(() => {
        if (!nickname) {
            history.push('/');
            return;
        }

        checkSocketState();
    }, []);

    serverClient.on('connect', checkSocketState);
    serverClient.on('disconnect', checkSocketState);

    if (socketLost) {
        return (
            <div>
                La connection au serveur a été perdue. Tentative de reconnexion
                en cours...
            </div>
        );
    }

    return <Engine />;
}
