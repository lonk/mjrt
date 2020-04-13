import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Client } from 'colyseus.js';

export default function Play() {
    const history = useHistory();
    const [nickname, setNickname] = useState('');
    let serverClient: Client;

    const joinServer = async () => {
        serverClient = new Client('ws://localhost:3001');
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
    });

    return <div>Lancer la partie</div>;
}
