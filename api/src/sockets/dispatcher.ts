import { generate } from 'shortid';
import { buildRoom, Room } from './room';

type RegistrationMessage = {
    playerId: string;
    nickname: string;
    roomId?: string;
};

const buildDispatcher = () => {
    const roomsById: Map<string, Room> = new Map();
    let currentPublicRoomId: string = generate();

    const handleSocket = (socket: SocketIO.Socket) => {
        socket.on(
            'register',
            ({ playerId, nickname, roomId }: RegistrationMessage) => {
                if (!playerId || !/^\w{2,12}$/.test(nickname)) {
                    socket.disconnect();
                }

                const roomIdToDispatch = roomId || currentPublicRoomId;
                const roomToDispatch = getRoomToDispatch(roomIdToDispatch);

                roomToDispatch.handleSocket(socket, playerId, nickname);

                socket.emit('registered', { roomId: roomIdToDispatch });
            }
        );
    };

    const getRoomToDispatch = (roomId: string) => {
        return (
            roomsById.get(roomId) ||
            createNewRoom(roomId)
        );
    };

    const createNewRoom = (roomId: string) => {
        const isPrivate = Boolean(roomId !== currentPublicRoomId);
        const room = buildRoom(roomId, isPrivate);
        roomsById.set(roomId, room);

        room.emitter.on('lock', () => {
            if (roomId === currentPublicRoomId) {
                currentPublicRoomId = generate();
            }
        });

        room.emitter.on('destroy', () => {
            roomsById.delete(roomId);
        });

        return room;
    };

    return {
        handleSocket,
        currentPublicRoomId,
        roomsById
    };
};

export const dispatcher = buildDispatcher();
