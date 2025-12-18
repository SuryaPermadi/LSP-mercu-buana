const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const SECRET_KEY = 'lsp-super-secret-key';
// In Vercel environment, standard file write persistence DOES NOT work.
// This will default to temporary storage or fail silently for persistence.
const DB_FILE = path.join(process.cwd(), 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../'), { extensions: ['html'] }));

// Admin Credentials
const ADMIN_USER = {
    username: 'admin',
    password: 'password123'
};

// Helper: Read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database:", err);
        return [];
    }
};

// Helper: Write DB (WARNING: Ephemeral in Vercel)
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf8');
    } catch (err) {
        console.error("Error writing database (Vercel is read-only):", err);
    }
};

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Akses ditolak. Silakan login.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
        req.user = user;
        next();
    });
};

// --- ROUTES ---

app.get('/api/schemes', (req, res) => {
    const schemes = readDB();
    res.json(schemes);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Username atau password salah!' });
    }
});

app.post('/api/schemes', authenticateToken, (req, res) => {
    const schemes = readDB();
    const newScheme = req.body;
    newScheme.id = schemes.length > 0 ? Math.max(...schemes.map(s => s.id)) + 1 : 1;
    schemes.push(newScheme);
    writeDB(schemes);
    res.status(201).json(newScheme);
});

app.put('/api/schemes/:id', authenticateToken, (req, res) => {
    const schemes = readDB();
    const id = parseInt(req.params.id);
    const updatedIdx = schemes.findIndex(s => s.id === id);

    if (updatedIdx === -1) return res.status(404).json({ message: 'Skema tidak ditemukan' });

    schemes[updatedIdx] = { ...req.body, id };
    writeDB(schemes);
    res.json(schemes[updatedIdx]);
});

app.delete('/api/schemes/:id', authenticateToken, (req, res) => {
    let schemes = readDB();
    const id = parseInt(req.params.id);
    schemes = schemes.filter(s => s.id !== id);
    writeDB(schemes);
    res.json({ message: 'Skema berhasil dihapus' });
});

app.post('/api/schemes/bulk-delete', authenticateToken, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: 'Format ID tidak valid' });

    let schemes = readDB();
    schemes = schemes.filter(s => !ids.includes(s.id));
    writeDB(schemes);
    res.json({ message: `${ids.length} skema berhasil dihapus` });
});

module.exports = app;
