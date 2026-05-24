const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Ensure only logged-in students can access this page
if (!token || !user || user.role !== 'student') {
    window.location.href = 'index.html';
}

function updateNavigation() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = `
        <a href="index.html">Home</a>
        <a href="profile.html" style="color: var(--primary); font-weight: bold;">My Bookings</a>
        <span style="margin-left: 15px; color: #ccc;">Student: <strong style="color: #fff;">${user.name}</strong></span>
        <a href="#" id="nav-logout" style="margin-left: 15px; color: var(--danger); font-weight: 600;">Logout</a>
    `;
    
    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

async function loadMyBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const bookings = await response.json();
        const list = document.getElementById('bookings-list');
        list.innerHTML = '';

        if (bookings.length === 0) {
            list.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 10px;">
                    <h3>You haven't booked any tickets yet.</h3>
                    <button onclick="window.location.href='index.html'" style="margin-top: 15px;">Browse Events</button>
                </div>`;
            return;
        }

        bookings.forEach(booking => {
            const event = booking.event;
            const div = document.createElement('div');
            div.className = 'event-card';
            
            // Check if the event still exists (in case an admin deleted it)
            if (!event) {
                div.innerHTML = `<p style="color: var(--danger);">Event details unavailable (Event may have been cancelled).</p>`;
            } else {
                const statusColor = booking.status === 'confirmed' ? 'var(--success)' : 'var(--danger)';
                const checkInStatus = booking.checkedIn ? 
                    '<span style="color: var(--success); font-weight: bold;">✅ Checked In</span>' : 
                    '<span style="color: orange; font-weight: bold;">Not Checked In Yet</span>';

                div.innerHTML = `
                    <h3>${event.name}</h3>
                    <p><strong>📍 Venue:</strong> ${event.venue}</p>
                    <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()} at ${new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                    <p><strong>🎟️ Seats:</strong> ${booking.seats.join(', ')}</p>
                    <p><strong>💰 Paid:</strong> ₹${booking.totalAmount}</p>
                    <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; text-align: center;">
                        <p style="margin-bottom: 5px;">Booking Status: <span style="color: ${statusColor}; font-weight: bold;">${booking.status.toUpperCase()}</span></p>
                        <p>Entry Status: ${checkInStatus}</p>
                    </div>
                `;
            }
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        document.getElementById('bookings-list').innerHTML = '<p style="color: red; grid-column: 1/-1; text-align: center;">Error loading bookings. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    loadMyBookings();
});