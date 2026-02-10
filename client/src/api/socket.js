import { io } from 'socket.io-client';

// Connect to the same host as api
const socket = io('/', {
    path: '/socket.io',
    transports: ['websocket', 'polling']
});

export default socket;
