import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { serverClient } from '../../server';
import Engine from '../../components/Engine/Engine';
import LoggedOut from '../../layouts/LoggedOut/LoggedOut';
import {
    SocketState,
    RegisterState,
    RegistrationPayload
} from '../../server/types';

export default function Play() {
    const history = useHistory();
    const { id } = useParams();
    const [socketState, setSocketState] = useState(SocketState.Connecting);
    const [registerState, setRegisterState] = useState(RegisterState.Pending);

    const checkSocketState = () => {
        if (serverClient.disconnected) {
            setSocketState(SocketState.Disconnected);
            return;
        }

        const nickname = localStorage.getItem('nickname');
        const playerId = localStorage.getItem('playerId');

        serverClient.emit('register', { nickname, playerId, roomId: id });

        serverClient.on('registration', (payload: RegistrationPayload) => {
            setSocketState(SocketState.Connected);
            setRegisterState(payload.code);

            if (payload.code !== RegisterState.Registered) {
                return;
            }

            if (payload.roomId !== id) {
                history.replace(`/play/${payload.roomId}`);
            }
        });
    };

    useEffect(() => {
        const nickname = localStorage.getItem('nickname');
        const playerId = localStorage.getItem('playerId');

        if (!nickname || !playerId) {
            if (id) history.push(`/login/${id}`);
            else history.push('/login');
            return;
        }

        serverClient.on('connect', checkSocketState);
        serverClient.on('disconnect', checkSocketState);
        checkSocketState();

        return () => {
            serverClient.off('connect', checkSocketState);
            serverClient.off('disconnect', checkSocketState);
            serverClient.off('registration');
        };
    }, []);

    if (socketState !== SocketState.Connected) {
        return (
            <LoggedOut>
                {socketState === SocketState.Connecting && (
                    <span>Connexion au serveur en cours...</span>
                )}
                {socketState === SocketState.Disconnected && (
                    <span>
                        La connection au serveur a été perdue.
                        <br />
                        Tentative de reconnexion en cours...
                    </span>
                )}
            </LoggedOut>
        );
    } else if (registerState !== RegisterState.Registered) {
        return (
            <LoggedOut>
                {registerState === RegisterState.Pending && (
                    <span>Chargement de la salle en cours...</span>
                )}
                {registerState === RegisterState.AlreadyConnected && (
                    <span>
                        Vous êtes déjà connecté via un autre onglet à cette
                        salle.
                    </span>
                )}
                {registerState === RegisterState.RoomLocked && (
                    <span>
                        La partie dans cette salle est en cours, il n'est pas
                        possible de la rejoindre pour le moment.
                    </span>
                )}
            </LoggedOut>
        );
    }

    return <Engine />;
}
