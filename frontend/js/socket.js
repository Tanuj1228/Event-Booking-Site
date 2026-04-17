const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to real-time server with ID:', socket.id);
});

socket.on('seatUpdate', (data) => {
    if (window.currentEventId === data.eventId) {
        if (Array.isArray(data.seats)) {
            data.seats.forEach(seatNum => updateSeatUI(seatNum, data.status));
        } else {
            updateSeatUI(data.seatNumber, data.status);
        }
    }
});

function updateSeatUI(seatNumber, status) {
    const seatElement = document.getElementById(`seat-${seatNumber}`);
    if (seatElement) {
        seatElement.classList.remove('booked', 'locked');
        if (status === 'locked') {
            seatElement.classList.add('locked');
        } else if (status === 'booked') {
            seatElement.classList.add('booked');
        }
    }
}