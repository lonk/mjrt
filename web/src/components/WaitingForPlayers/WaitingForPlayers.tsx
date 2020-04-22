import React from 'react';
import { serverClient } from '../../server';
import { ServerState } from '../../server/types';
import styles from './WaitingForPlayers.module.css';

interface Props {
    serverState: ServerState;
    onStart: () => void;
}

export default function WaitingForPlayers({ serverState, onStart }: Props) {
    const isPlayerRoomMaster = () => {
        const player = serverState.players.find(
            player => player.sessionId === serverClient.id
        );

        return player && player.isRoomMaster;
    };

    return (
        <div className={styles.waitingForPlayers}>
            {serverState.isPrivate && serverState.players.length <= 2 && (
                <span>En attente de 3 joueurs pour lancer la partie.</span>
            )}
            {serverState.isPrivate &&
                serverState.players.length > 2 &&
                !isPlayerRoomMaster() && (
                    <span>
                        En attente du feu vert du créateur de la partie.
                    </span>
                )}
            {serverState.isPrivate &&
                serverState.players.length > 2 &&
                isPlayerRoomMaster() && (
                    <span>
                        Cliquez{' '}
                        <a href="#" onClick={e => onStart()}>
                            ici
                        </a>{' '}
                        pour lancer la partie.
                    </span>
                )}
            {!serverState.isPrivate && (
                <span>En attente de 5 joueurs pour lancer la partie.</span>
            )}
            <br />
            {!isPlayerRoomMaster() && (
                <span>
                    Nous vous enverrons une notification quand la partie sera
                    sur le point de commencer !
                </span>
            )}
        </div>
    );
}