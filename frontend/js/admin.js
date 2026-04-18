const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'admin') {
    window.location.href = 'index.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

const tabDashboard = document.getElementById('tab-dashboard');
const tabCreate = document.getElementById('tab-create');
const secDashboard = document.getElementById('dashboard-section');
const secCreate = document.getElementById('create-section');

tabDashboard.addEventListener('click', () => {
    tabDashboard.classList.add('active');
    tabCreate.classList.remove('active');
    secDashboard.style.display = 'block';
    secCreate.style.display = 'none';
    if(typeof gsap !== 'undefined') gsap.from(secDashboard, {opacity: 0, y: 10, duration: 0.4});
});

tabCreate.addEventListener('click', () => {
    tabCreate.classList.add('active');
    tabDashboard.classList.remove('active');
    secCreate.style.display = 'block';
    secDashboard.style.display = 'none';
    if(typeof gsap !== 'undefined') gsap.from(secCreate, {opacity: 0, y: 10, duration: 0.4});
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
    }
});

async function loadDashboardData() {
    try {
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await statsRes.json();

        document.getElementById('stat-revenue').innerText = `₹${stats.totalRevenue}`;
        document.getElementById('stat-bookings').innerText = stats.totalBookings;
        document.getElementById('stat-users').innerText = stats.totalUsers;

        const analyticsRes = await fetch(`${API_URL}/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const analytics = await analyticsRes.json();

        const totalTickets = analytics.reduce((sum, item) => sum + item.ticketsSold, 0);
        document.getElementById('stat-tickets').innerText = totalTickets;

        renderChart(analytics);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

let revenueChartInstance = null;

function renderChart(analyticsData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    const labels = analyticsData.map(a => a.eventName);
    const revenueData = analyticsData.map(a => a.revenue);
    const ticketsData = analyticsData.map(a => a.ticketsSold);

    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue (₹)',
                    data: revenueData,
                    backgroundColor: 'rgba(108, 99, 255, 0.7)',
                    borderColor: 'rgba(108, 99, 255, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Tickets Sold',
                    data: ticketsData,
                    type: 'line',
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Revenue (₹)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Tickets Sold' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', loadDashboardData);