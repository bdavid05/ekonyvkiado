const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statikus fájlok kiszolgálása
app.use(express.static('public'));

// Adatbázis kapcsolat
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ekonyvkiado'  // Változtasd meg a megfelelő adatbázisra
});

// Kapcsolódás az adatbázishoz
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Felhasználó regisztráció

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Jelszó hashelése
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Hiba a jelszó hashelése során:', err);
            return res.status(500).send('Hiba történt a regisztráció során.');
        }

        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hash], (err, result) => {
            if (err) {
                console.error('Hiba az adatbázisban:', err); // Hiba kiírása
                return res.status(500).send('Hiba történt a regisztráció során.');
            }
            res.status(200).send('Sikeres regisztráció!');
        });
    });
});

// Felhasználó bejelentkezés
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            return res.status(500).send('Hiba történt a bejelentkezés során.');
        }
        if (result.length > 0) {
            res.status(200).send('Sikeres bejelentkezés!');
        } else {
            res.status(401).send('Hibás e-mail vagy jelszó!');
        }
    });
});

// HTML fájlok kiszolgálása
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
