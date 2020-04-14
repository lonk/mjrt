import io from 'socket.io-client';

export const buildServer = () => {
    return io('http://localhost:3001');
};
