import React, { useState, useEffect } from 'react';
import Notification from 'react-web-notification';

export default function Notify(props: any) {
    const [isGranted, setIsGranted] = useState(false);
    const [notificationShown, setNotificationShown] = useState(true);
    const audio = new Audio('./notify.mp3');

    useEffect(() => {
        audio.load();
    }, []);

    useEffect(() => {
        if (props.notify) {
            setNotificationShown(false);
            audio.play();
        }
    }, [props.notify]);

    const check = () => {
        setNotificationShown(true);
    };

    return (
        <Notification
            ignore={!isGranted || notificationShown}
            askAgain={true}
            onPermissionGranted={() => setIsGranted(true)}
            onShow={() => check()}
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
        />
    );
}
