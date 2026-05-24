const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'organizer') {
    window.location.href = 'index.html';
}

function updateNavigation() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = `
        <a href="index.html">Home</a>
        <span style="margin-left: 15px; color: #ccc;">Organizer: <strong style="color: #fff;">${user.name}</strong></span>
        <a href="#" id="nav-logout" style="margin-left: 15px; color: var(--danger); font-weight: 600;">Logout</a>
    `;
    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

const tabMyEvents = document.getElementById('tab-my-events');
const tabCreate = document.getElementById('tab-create');
const tabScan = document.getElementById('tab-scan');
const secMyEvents = document.getElementById('my-events-section');
const secCreate = document.getElementById('create-section');
const secScan = document.getElementById('scan-section');

let html5QrcodeScanner = null;

function hideAllSections() {
    secMyEvents.style.display = 'none';
    secCreate.style.display = 'none';
    if (secScan) secScan.style.display = 'none';
    
    tabMyEvents.classList.remove('active');
    tabCreate.classList.remove('active');
    if (tabScan) tabScan.classList.remove('active');
    
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
}

tabMyEvents.addEventListener('click', () => {
    hideAllSections();
    tabMyEvents.classList.add('active');
    secMyEvents.style.display = 'block';
    loadMyEvents();
});

tabCreate.addEventListener('click', () => {
    hideAllSections();
    tabCreate.classList.add('active');
    secCreate.style.display = 'block';
});

if (tabScan) {
    tabScan.addEventListener('click', () => {
        hideAllSections();
        tabScan.classList.add('active');
        secScan.style.display = 'block';
        startScanner();
    });
}

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
            alert('Event submitted successfully! Waiting for Admin approval.');
            document.getElementById('create-event-form').reset();
            tabMyEvents.click(); 
        } else {
            alert(data.message || 'Failed to submit event');
        }
    } catch (error) {
        console.error('Error creating event:', error);
    }
});

async function loadMyEvents() {
    try {
        const response = await fetch(`${API_URL}/organizer/my-events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await response.json();
        const list = document.getElementById('organizer-events-list');
        list.innerHTML = '';

        if (events.length === 0) {
            list.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">You have not hosted any events yet.</p>';
            return;
        }

        events.forEach(event => {
            const statusColor = event.status === 'approved' ? 'var(--success, #4CAF50)' : event.status === 'rejected' ? 'var(--danger)' : 'orange';
            const div = document.createElement('div');
            div.className = 'event-card';
            div.innerHTML = `
                <h3>${event.name}</h3>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Tickets:</strong> ₹${event.price} (${event.totalSeats} seats)</p>
                <p style="margin-top: 10px; font-weight: bold; color: ${statusColor}">Status: ${event.status.toUpperCase()}</p>
                <button onclick="exportCSV('${event._id}')" style="margin-top: 15px; width: 100%; padding: 8px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">Download Attendees CSV</button>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

window.exportCSV = async function(eventId) {
    try {
        const response = await fetch(`${API_URL}/organizer/export/${eventId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            const err = await response.json();
            alert(err.message || 'Could not export data');
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event_${eventId}_attendees.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Export error:', error);
    }
};

function startScanner() {
    const resultDiv = document.getElementById('scan-result');
    resultDiv.innerHTML = "Ready to scan...";
    resultDiv.style.color = "black";

    let isProcessing = false;

    async function onScanSuccess(decodedText) {
        if (isProcessing) return; 
        isProcessing = true;
        
        try {
            const response = await fetch(`${API_URL}/organizer/check-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookingId: decodedText }) 
            });
            
            const data = await response.json();
            
            if (response.ok) {
                resultDiv.innerHTML = `✅ ${data.message}`;
                resultDiv.style.color = "green";
            } else {
                resultDiv.innerHTML = `❌ Error: ${data.message}`;
                resultDiv.style.color = "red";
            }
        } catch (err) {
            resultDiv.innerHTML = "❌ Network Error";
            resultDiv.style.color = "red";
        }

        setTimeout(() => { isProcessing = false; }, 3000); 
    }

    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    html5QrcodeScanner.render(onScanSuccess);
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    loadMyEvents();
});