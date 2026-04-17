const API_URL = 'http://localhost:5000/api';

async function fetchEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        const events = await response.json();
        const eventList = document.getElementById('event-list');
        eventList.innerHTML = '';

        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-card';
            eventDiv.innerHTML = `
                <h3>${event.name}</h3>
                <p>Venue: ${event.venue}</p>
                <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                <p>Price: Rs. ${event.price}</p>
                <button onclick="viewEvent('${event._id}')">View Seats</button>
            `;
            eventList.appendChild(eventDiv);
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function viewEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/events/${eventId}`);
        const event = await response.json();
        
        const eventList = document.getElementById('event-list');
        let seatsHtml = '<div class="seat-map" id="seat-map">';
        
        event.seats.forEach(seat => {
            let statusClass = '';
            if (!seat.isAvailable) statusClass = 'booked';
            
            seatsHtml += `<div class="seat ${statusClass}" id="seat-${seat.seatNumber}" onclick="selectSeat('${eventId}', '${seat.seatNumber}')">${seat.seatNumber}</div>`;
        });
        seatsHtml += '</div>';

        eventList.innerHTML = `
            <h3>${event.name} - Seat Selection</h3>
            <button onclick="fetchEvents()">Back to Events</button>
            ${seatsHtml}
        `;
        
        window.currentEventId = eventId;
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}

async function selectSeat(eventId, seatNumber) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings/lock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ eventId, seatNumber })
        });

        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error locking seat:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchEvents);