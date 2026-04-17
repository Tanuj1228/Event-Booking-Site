const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = 'index.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

document.getElementById('create-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventData = {
        name: document.getElementById('eventName').value,
        venue: document.getElementById('venue').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        price: Number(document.getElementById('price').value),
        totalSeats: Number(document.getElementById('totalSeats').value)
    };

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Event created successfully!');
            document.getElementById('create-event-form').reset();
        } else {
            alert(data.message || 'Failed to create event');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        alert('An error occurred while creating the event.');
    }
});