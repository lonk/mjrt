import React from 'react';
import { serverClient } from '../../server';
import { ServerState } from '../../server/types';
import styles from './Finished.module.css';

interface Props {
    serverState: ServerState;
    onRestart: () => void;
}

export default function Finished({ serverState, onRestart }: Props) {
    const isPlayerRoomMaster = () => {
        const player = serverState.players.find(
            player => player.sessionId === serverClient.id
        );

        return player && player.isRoomMaster;
    };

    const generateWinners = () => {
        const winners = serverState.players.filter(player => player.lives > 0);

        if (winners.length === 0) {
            return <span>Il n'y a eu aucun gagnant.</span>;
        } else if (winners.length === 1) {
            return (
                <span>
                    La victoire revient à <strong>{winners[0].nickname}</strong>{' '}
                    : un grand bravo !
                </span>
            );
        } else if (winners.length === 2) {
            return (
                <span>
                    On applaudit <strong>{winners[0].nickname}</strong> et{' '}
                    <strong>{winners[1].nickname}</strong> pour cette partie
                    exemplaire !
                </span>
            );
        }

        return <span></span>;
    };

    return (
        <div className={styles.finished}>
            {!serverState.isPrivate && (
                <span>
                    Partie terminée, cliquez <a href="/play">ici</a> pour
                    rejouer !
                </span>
            )}
            {serverState.isPrivate && !isPlayerRoomMaster() && (
                <span>
                    Partie terminée, le créateur de la partie peut maintenant en
                    relancer une.
                </span>
            )}
            {serverState.isPrivate && isPlayerRoomMaster() && (
                <span>
                    Partie terminée, cliquez{' '}
                    <a href="#" onClick={e => onRestart()}>
                        ici
                    </a>{' '}
                    pour relancer une partie.
                </span>
            )}
            <br />
            {generateWinners()}
        </div>
    );
}
