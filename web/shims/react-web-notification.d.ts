declare module 'react-web-notification' {
    import React from 'react';

    interface NotificationProps {
        title: string;
        ignore?: boolean;
        disableActiveWindow?: boolean;
        askAgain?: boolean;
        notSupported?: () => void;
        onPermissionGranted?: () => void;
        onPermissionDenied?: () => void;
        onShow?: () => void;
        onClick?: () => void;
        onClose?: () => void;
        onError?: () => void;
        timeout?: number;
        options?: NotificationOptions;
        swRegistration?: ServiceWorkerRegistration;
    }

    export default class Notification extends React.Component<
        NotificationProps
    > {}
}
