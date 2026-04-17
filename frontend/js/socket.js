const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to real-time server with ID:', socket.id);
});