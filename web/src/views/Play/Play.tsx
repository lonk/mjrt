import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { serverClient } from '../../server';
import Engine from '../../components/Engine/Engine';

export default function Play() {
    const history = useHistory();
    const [nickname] = useState(localStorage.getItem('nickname'));

    useEffect(() => {
        if (!nickname) {
            history.push('/');
            return;
        }

        serverClient.emit('setNickname', { nickname })
    }, []);

    const success = <Engine />;

    return success;
}
