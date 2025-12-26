const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());

// --- MOCK DATABASE ---
// In a real deployment, this would connect to PostgreSQL or MongoDB.
// For now, we keep data in memory so the app works immediately for the developer.

const ADMIN_USER = {
    email: 'admin@bleedbuddy.com',
    password: 'password123' // In production, hash this!
};

const MOCK_USERS = Array.from({ length: 20 }, (_, i) => ({
    id: `usr_${1000 + i}`,
    email: `customer${i + 1}@example.com`,
    plan: i % 3 === 0 ? 'Pro' : 'Free',
    joinDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    subscriptionStatus: i % 3 === 0 ? 'active' : 'canceled',
    processedFiles: [
        {
            id: `file_${i}_a`,
            fileName: `flyer_design_${i}.pdf`,
            processedDate: new Date().toISOString(),
            status: Math.random() > 0.1 ? 'Completed' : 'Failed'
        }
    ]
}));

const MOCK_TRANSACTIONS = Array.from({ length: 15 }, (_, i) => ({
    id: `txn_${5000 + i}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
    customerEmail: `customer${(i % 5) + 1}@example.com`,
    amount: i % 2 === 0 ? 19.95 : 5.99,
    status: i === 0 ? 'Refunded' : (i === 4 ? 'Failed' : 'Succeeded')
}));

const MOCK_ACTIVITY = [
    { id: 'act_1', userEmail: 'customer1@example.com', action: 'processed "Summer_Menu.pdf"', timestamp: '2 mins ago' },
    { id: 'act_2', userEmail: 'customer5@example.com', action: 'upgraded to Pro Plan', timestamp: '15 mins ago' },
    { id: 'act_3', userEmail: 'customer2@example.com', action: 'processed "BizCard_Front.pdf"', timestamp: '1 hour ago' },
    { id: 'act_4', userEmail: 'customer2@example.com', action: 'processed "BizCard_Back.pdf"', timestamp: '1 hour ago' },
    { id: 'act_5', userEmail: 'new_user@test.com', action: 'created an account', timestamp: '3 hours ago' },
];

const REVENUE_DATA = {
    totalRevenue: 12450.00,
    mrr: 2150.00,
    newUsers: 145,
    filesProcessed: 892,
    chartData: [
        { name: 'Jan', Revenue: 4000 },
        { name: 'Feb', Revenue: 3000 },
        { name: 'Mar', Revenue: 5000 },
        { name: 'Apr', Revenue: 2780 },
        { name: 'May', Revenue: 1890 },
        { name: 'Jun', Revenue: 2390 },
    ]
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// 1. Admin Login
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;

    // Simple credential check
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
        // Generate JWT
        const token = jwt.sign({ email: email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid email or password' });
});

// 2. Admin Logout (Client handles token removal, server just acknowledges)
app.post('/api/admin/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// 3. Dashboard Data
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
    res.json({
        revenueData: REVENUE_DATA,
        recentActivity: MOCK_ACTIVITY
    });
});

// 4. Users List (with basic filtering)
app.get('/api/admin/users', authenticateToken, (req, res) => {
    const { email, plan } = req.query;
    let results = MOCK_USERS;

    if (email) {
        results = results.filter(u => u.email.toLowerCase().includes(email.toLowerCase()));
    }
    if (plan && plan !== 'All') {
        results = results.filter(u => u.plan === plan);
    }

    res.json(results);
});

// 5. Single User Detail
app.get('/api/admin/users/:id', authenticateToken, (req, res) => {
    const user = MOCK_USERS.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// 6. Financials/Transactions
app.get('/api/admin/financials', authenticateToken, (req, res) => {
    const { customerEmail } = req.query;
    let results = MOCK_TRANSACTIONS;

    if (customerEmail) {
        results = results.filter(t => t.customerEmail.toLowerCase().includes(customerEmail.toLowerCase()));
    }

    res.json(results);
});

// 7. Refund Action
app.post('/api/admin/transactions/:id/refund', authenticateToken, (req, res) => {
    const txnId = req.params.id;
    const txnIndex = MOCK_TRANSACTIONS.findIndex(t => t.id === txnId);

    if (txnIndex === -1) return res.status(404).json({ error: 'Transaction not found' });

    MOCK_TRANSACTIONS[txnIndex].status = 'Refunded';
    res.json({ message: `Transaction ${txnId} has been refunded successfully.` });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`BleedBuddy Backend Server running on port ${PORT}`);
});
