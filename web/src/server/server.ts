import io from 'socket.io-client';

export const buildServer = () => {
    if (process.env.NODE_ENV === 'development') {
        return io('http://localhost:3001');
    }

    return io();
};
