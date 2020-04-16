import { generate } from 'shortid';
import { GameRoom } from '../game';
import { Player, buildPlayer } from '../player';
import { buildGameRoom } from './gameRoomManager';

type RegistrationMessage = {
    playerId: string;
    nickname: string;
    roomId?: string;
};

const buildRoomsManager = () => {
    const roomsById: Map<string, GameRoom> = new Map();
    let currentPublicRoomId: string = generate();

    const handleSocket = (socket: SocketIO.Socket) => {
        socket.once(
            'register',
            ({ playerId, nickname, roomId }: RegistrationMessage) => {
                const roomToJoin = roomId || currentPublicRoomId;

                addPlayerToRoom(
                    roomToJoin,
                    buildPlayer(socket, playerId, nickname)
                );

                socket.emit('registered');
            }
        );
    };

    const createNewRoom = (roomId: string) => {
        const room = buildGameRoom(roomId);
        roomsById.set(roomId, room);

        room.eventEmitter.on('lock', () => {
            if (roomId === currentPublicRoomId) {
                currentPublicRoomId = generate();
            }
        });

        room.eventEmitter.on('destroy', () => {
            roomsById.delete(roomId);
        });

        return room;
    };

    const addPlayerToRoom = (roomId: string, player: Player) => {
        const room = roomsById.get(roomId) || createNewRoom(roomId);
        room.handlePlayer(player);
    };

    return {
        handleSocket
    };
};

export const roomsManager = buildRoomsManager();
