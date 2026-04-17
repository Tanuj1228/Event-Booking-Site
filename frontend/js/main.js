const API_URL = 'http://localhost:5000/api';
let selectedSeats = [];
let currentEventPrice = 0;

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
                <button onclick="viewEvent('${event._id}', ${event.price})">View Seats</button>
            `;
            eventList.appendChild(eventDiv);
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function viewEvent(eventId, price) {
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
            <button onclick="fetchEvents()" style="margin-bottom: 10px;">Back to Events</button>
            ${seatsHtml}
            <div id="booking-section" style="margin-top: 20px; display: none;">
                <h4>Selected Seats: <span id="selected-seats-display">None</span></h4>
                <h4>Total Amount: Rs. <span id="total-amount-display">0</span></h4>
                <button onclick="bookTickets('${eventId}')" style="background: #007bff; color: white; padding: 10px; border: none; cursor: pointer;">Confirm Booking</button>
            </div>
        `;
        
        window.currentEventId = eventId;
        currentEventPrice = price;
        selectedSeats = [];
    } catch (error) {
        console.error('Error fetching event details:', error);
    }
}

async function selectSeat(eventId, seatNumber) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    const seatElement = document.getElementById(`seat-${seatNumber}`);
    if (seatElement.classList.contains('booked')) return;

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
            if (!selectedSeats.includes(seatNumber)) {
                selectedSeats.push(seatNumber);
            }
            updateBookingUI();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error locking seat:', error);
    }
}

function updateBookingUI() {
    const bookingSection = document.getElementById('booking-section');
    const seatsDisplay = document.getElementById('selected-seats-display');
    const amountDisplay = document.getElementById('total-amount-display');

    if (selectedSeats.length > 0) {
        bookingSection.style.display = 'block';
        seatsDisplay.innerText = selectedSeats.join(', ');
        amountDisplay.innerText = selectedSeats.length * currentEventPrice;
    } else {
        bookingSection.style.display = 'none';
    }
}

async function bookTickets(eventId) {
    const token = localStorage.getItem('token');
    const totalAmount = selectedSeats.length * currentEventPrice;

    try {
        const response = await fetch(`${API_URL}/bookings/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ eventId, seats: selectedSeats, totalAmount })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Booking confirmed successfully!');
            selectedSeats = [];
            updateBookingUI();
        } else {
            alert(data.message || 'Booking failed');
        }
    } catch (error) {
        console.error('Error booking tickets:', error);
    }
}

// ... Replace the previous updateNavigation function with this one ...

function updateNavigation() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const nav = document.getElementById('main-nav');

    if (token && user) {
        let navHtml = `<a href="index.html">Home</a>`;
        
        if (user.role === 'admin') {
            navHtml += `<a href="admin.html">Admin Dashboard</a>`;
        } else {
            navHtml += `<a href="profile.html">My Bookings</a>`;
        }
        
        navHtml += `
            <span style="margin-left: 15px; color: #ccc;">Welcome, ${user.name}</span>
            <a href="#" id="nav-logout" style="margin-left: 15px; color: #ff4d4d;">Logout</a>
        `;
        
        if (nav) {
            nav.innerHTML = navHtml;
            
            const logoutBtn = document.getElementById('nav-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
    updateNavigation();
});
