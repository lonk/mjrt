import { Gauge } from 'prom-client';

export const nbRooms = new Gauge({
    name: 'nb_rooms',
    help: 'Number of rooms',
    labelNames: ['type']
});

export const nbSockets = new Gauge({
    name: 'room_nb_sockets',
    help: 'Number of sockets inside the room',
    labelNames: ['roomId']
});

export const nbOnlinePlayers = new Gauge({
    name: 'room_nb_online_players',
    help: 'Number of logged players inside the room',
    labelNames: ['roomId']
})
