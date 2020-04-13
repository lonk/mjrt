import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { serverClient } from '../../server';

export default function Play() {
    const history = useHistory();
    const [nickname, setNickname] = useState('');

    const joinServer = async () => {
        const availableRooms = await serverClient.getAvailableRooms();

        console.log(availableRooms);
    };

    useEffect(() => {
        const storedNickname = localStorage.getItem('nickname');

        if (!storedNickname) {
            history.push('/');
            return;
        }

        setNickname(storedNickname);
        joinServer();
    }, []);

    return <div>Lancer la partie</div>;
}
