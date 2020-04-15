import React, { useState, useEffect } from 'react';
import Notification from 'react-web-notification';

export default function Notify(props: any) {
    const [isGranted, setIsGranted] = useState(false);
    const [notificationShown, setNotificationShown] = useState(true);
    const [registration, setRegistration] = useState<
        ServiceWorkerRegistration
    >();
    const audio = new Audio('./notify.mp3');

    useEffect(() => {
        // Will force re-render due to the previous setNotificationShown === false
        setNotificationShown(true);
    });

    useEffect(() => {
        registerSw();
        audio.load();
    }, []);

    useEffect(() => {
        if (props.notify) {
            setNotificationShown(false);
            audio.play();
        }
    }, [props.notify]);

    const registerSw = async () => {
        const navigatorRegistration = await navigator.serviceWorker.register(
            'sw.js'
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
