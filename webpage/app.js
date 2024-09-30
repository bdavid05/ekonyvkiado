const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

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
    database: 'regisztráció'
});

// Kapcsolódás az adatbázishoz
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Regisztrációs végpont
app.post('/register', (req, res) => {
    const { full_name, email, gender, personal_id, phone_number, birth_date, city, street_address, password } = req.body;

    const sql = 'INSERT INTO Users (full_name, email, gender, personal_id, phone_number, birth_date, city, street_address, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [full_name, email, gender, personal_id, phone_number, birth_date, city, street_address, password], (err, result) => {
        if (err) {
            return res.status(500).send('Hiba történt az adatbevitel során');
        }
        res.status(200).send('Sikeres regisztráció!');
    });
});

// HTML fájl kiszolgálása
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Itt ad meg az HTML fájl elérési útját
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
