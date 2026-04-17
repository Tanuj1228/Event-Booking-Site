const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'login.html';
}

function setupNav() {
    const nav = document.getElementById('main-nav');
    let navHtml = `<a href="index.html">Home</a>`;
    if (user.role === 'admin') {
        navHtml += `<a href="admin.html">Admin Dashboard</a>`;
    }
    navHtml += `
        <span style="margin-left: 15px; color: #ccc;">Welcome, ${user.name}</span>
        <a href="#" id="nav-logout" style="margin-left: 15px; color: #ff4d4d;">Logout</a>
    `;
    nav.innerHTML = navHtml;

    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

async function fetchMyBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings/mybookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const bookings = await response.json();
        const bookingsList = document.getElementById('bookings-list');
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p>You have no bookings yet.</p>';
            return;
        }

        bookings.forEach(booking => {
            const bookingDiv = document.createElement('div');
            bookingDiv.className = 'event-card';
            bookingDiv.innerHTML = `
                <h3>${booking.event.name}</h3>
                <p><strong>Venue:</strong> ${booking.event.venue}</p>
                <p><strong>Date:</strong> ${new Date(booking.event.date).toLocaleString()}</p>
                <p><strong>Seats:</strong> ${booking.seats.join(', ')}</p>
                <p><strong>Total Amount:</strong> Rs. ${booking.totalAmount}</p>
                <p><strong>Status:</strong> <span style="color: ${booking.status === 'confirmed' ? 'green' : 'orange'}">${booking.status.toUpperCase()}</span></p>
                <p><small>Booking ID: ${booking._id}</small></p>
            `;
            bookingsList.appendChild(bookingDiv);
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        document.getElementById('bookings-list').innerHTML = '<p>Error loading bookings.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    fetchMyBookings();
});