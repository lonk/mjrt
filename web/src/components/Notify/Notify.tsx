import React, { useState, useEffect } from 'react';
import Notification from 'react-web-notification';
import { GameState } from '../../server/types';

interface Props {
    gameState: GameState;
}

export default function Notify({ gameState }: Props) {
    const [isGranted, setIsGranted] = useState(false);
    const [notificationShown, setNotificationShown] = useState(true);
    const [registration, setRegistration] = useState<
        ServiceWorkerRegistration
    >();

    useEffect(() => {
        registerSw();
    }, []);

    useEffect(() => {
        if (!notificationShown) {
            setNotificationShown(true);
        }
    }, [notificationShown]);

    useEffect(() => {
        if (gameState === GameState.AboutToStart) {
            setNotificationShown(false);
        }
    }, [gameState]);

    const registerSw = async () => {
        if (!('serviceWorker' in navigator)) return;

        const navigatorRegistration = await navigator.serviceWorker.register(
            '/sw.js'
        );
        setRegistration(navigatorRegistration);
    };

    return (
        <div>
            {Boolean(registration) && (
                <Notification
                    ignore={!isGranted || notificationShown}
                    askAgain={true}
                    onPermissionGranted={() => setIsGranted(true)}
                    timeout={5000}
                    title="Mjrt.net"
                    options={{
                        tag: Date.now().toString(),
                        body: 'La partie est sur le point de commencer',
                        icon:
                            'http://mobilusoss.github.io/react-web-notification/example/Notifications_button_24.png',
                        lang: 'fr',
                        dir: 'ltr'
                    }}
                    swRegistration={registration}
                />
            )}
        </div>
    );
}
