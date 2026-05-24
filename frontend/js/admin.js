const API_URL = 'https://eventease-backend-0qqu.onrender.com/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'admin') {
    window.location.href = 'index.html';
}

function updateNavigation() {
    const nav = document.getElementById('main-nav');
    if (nav) {
        nav.innerHTML = `
            <a href="index.html">Home</a>
            <span style="margin-left: 15px; color: #ccc;">Admin: <strong style="color: #fff;">${user.name}</strong></span>
            <a href="#" id="nav-logout" style="margin-left: 15px; color: var(--danger); font-weight: 600;">Logout</a>
        `;
        document.getElementById('nav-logout').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    } else {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            });
        }
    }
}

const tabDashboard = document.getElementById('tab-dashboard');
const tabApprovals = document.getElementById('tab-approvals');
const secDashboard = document.getElementById('dashboard-section');
const secApprovals = document.getElementById('approvals-section');

if (tabDashboard && tabApprovals) {
    tabDashboard.addEventListener('click', () => {
        tabDashboard.classList.add('active');
        tabApprovals.classList.remove('active');
        secDashboard.style.display = 'block';
        secApprovals.style.display = 'none';
        if(typeof gsap !== 'undefined') gsap.from(secDashboard, {opacity: 0, y: 10, duration: 0.4});
    });

    tabApprovals.addEventListener('click', () => {
        tabApprovals.classList.add('active');
        tabDashboard.classList.remove('active');
        secApprovals.style.display = 'block';
        secDashboard.style.display = 'none';
        if(typeof gsap !== 'undefined') gsap.from(secApprovals, {opacity: 0, y: 10, duration: 0.4});
        loadPendingEvents();
    });
}

async function loadDashboardData() {
    try {
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await statsRes.json();

        document.getElementById('stat-revenue').innerText = `₹${stats.totalRevenue || 0}`;
        document.getElementById('stat-bookings').innerText = stats.totalBookings || 0;
        document.getElementById('stat-users').innerText = stats.totalUsers || 0;

        const analyticsRes = await fetch(`${API_URL}/admin/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const analytics = await analyticsRes.json();

        analytics.sort((a, b) => a.eventName.localeCompare(b.eventName));

        const totalTickets = analytics.reduce((sum, item) => sum + item.ticketsSold, 0);
        document.getElementById('stat-tickets').innerText = totalTickets || 0;

        renderChart(analytics);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

let revenueChartInstance = null;

function renderChart(analyticsData) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
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
                    yAxisID: 'y',
                    order: 2 
                },
                {
                    label: 'Tickets Sold',
                    data: ticketsData,
                    type: 'line',
                    backgroundColor: 'rgba(76, 175, 80, 1)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: 'rgba(76, 175, 80, 1)',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.3,
                    yAxisID: 'y1',
                    order: 1 
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
                    grid: { drawOnChartArea: false },
                    min: 0 
                }
            }
        }
    });
}

async function loadPendingEvents() {
    try {
        const response = await fetch(`${API_URL}/admin/pending-events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await response.json();
        const list = document.getElementById('pending-events-list');
        if (!list) return;

        list.innerHTML = '';

        if (events.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text);">No pending events to approve.</p>';
            return;
        }

        events.forEach(event => {
            const div = document.createElement('div');
            div.style.background = 'white';
            div.style.padding = '20px';
            div.style.borderRadius = '10px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            
            const organizerName = event.organizer ? event.organizer.name : 'Unknown';
            const organizerEmail = event.organizer ? event.organizer.email : 'Unknown';
            
            div.innerHTML = `
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 5px;">${event.name}</h3>
                    <p style="margin-bottom: 5px; color: #555;"><strong>Organizer:</strong> ${organizerName} (${organizerEmail})</p>
                    <p style="color: #555;"><strong>Details:</strong> ${event.venue} | ${new Date(event.date).toLocaleDateString()} | ₹${event.price}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="updateStatus('${event._id}', 'approved')" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Approve</button>
                    <button onclick="updateStatus('${event._id}', 'rejected')" style="background: var(--danger); color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Reject</button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading pending events:', error);
    }
}

window.updateStatus = async function(eventId, status) {
    if (!confirm(`Are you sure you want to ${status} this event?`)) return;

    try {
        const response = await fetch(`${API_URL}/admin/event-status/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            alert(`Event ${status} successfully!`);
            loadPendingEvents(); 
            loadDashboardData(); 
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    loadDashboardData();
});