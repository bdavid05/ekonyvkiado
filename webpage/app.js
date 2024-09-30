const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');  // Jelszótitkosításhoz szükséges
const session = require('express-session');  // Felhasználói session kezeléshez

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statikus fájlok kiszolgálása
app.use(express.static('public'));

// Session kezelés
app.use(session({
    secret: 'titkos_kulcs',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Ha HTTPS-t használsz, akkor secure: true
}));

// Adatbázis kapcsolat
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ekonyvkiado'
});

// Kapcsolódás az adatbázishoz
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Fájlfeltöltés beállítása (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // PDF fájlok tárolási helye
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Egyedi fájlnév
    }
});
const upload = multer({ storage: storage });

// Felhasználó regisztráció
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Jelszó titkosítása bcrypt használatával
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).send('Hiba történt a regisztráció során.');
        }
        res.status(200).send('Sikeres regisztráció!');
    });
});

// Felhasználó bejelentkezés
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).send('Hiba történt az adatbázis lekérdezésekor.');
        }
        if (results.length === 0) {
            return res.status(400).send('Helytelen email vagy jelszó.');
        }

        const user = results[0];

        // Jelszó ellenőrzése bcrypt használatával
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Helytelen email vagy jelszó.');
        }

        // Bejelentkezési session létrehozása
        req.session.userId = user.id;
        res.status(200).send('Sikeres bejelentkezés!');
    });
});

// Könyv feltöltése (PDF fájl és adatok)
app.post('/upload-book', upload.single('pdf_file'), (req, res) => {
    const { title, author_id, genre, description } = req.body;
    const filePath = req.file.path;  // A feltöltött PDF fájl elérési útja

    const sql = 'INSERT INTO books (title, author_id, genre, description, file_path) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, author_id, genre, description, filePath], (err, result) => {
        if (err) {
            return res.status(500).send('Hiba történt a könyv feltöltésekor.');
        }
        res.status(200).send('Könyv sikeresen feltöltve!');
    });
});

// Könyv oldalak kinyerése (példa megoldás a PDF oldalak képformátumba konvertálására)
app.post('/extract-pages', (req, res) => {
    const { book_id } = req.body;

    // Példa logika PDF oldalak képpé konvertálására (ezt a gyakorlatban PDF-to-image konverterrel lehet megoldani)
    const pdfPath = `uploads/${book_id}.pdf`;  // PDF fájl útvonala
    const imagePath = `uploads/pages/${book_id}_page_1.jpg`;  // Egy példa kép útvonala
    
    // Ebben az esetben csak feltételezzük, hogy van egy konverziós folyamat
    const sql = 'INSERT INTO pages (book_id, page_number, image_path) VALUES (?, ?, ?)';
    db.query(sql, [book_id, 1, imagePath], (err, result) => {
        if (err) {
            return res.status(500).send('Hiba történt az oldalak kinyerésekor.');
        }
        res.status(200).send('Oldalak sikeresen kinyerve!');
    });
});

// HTML fájl kiszolgálása
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Szerver indítása
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
