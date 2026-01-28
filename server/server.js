const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

// Create table if not exists
// Create table if not exists and handle migration
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT,
      pages INTEGER,
      read INTEGER DEFAULT 0,
      summary TEXT,
      genre TEXT,
      year INTEGER,
      borrowed INTEGER DEFAULT 0
    )
  `);

    // Migration to add year column if it doesn't exist
    db.run("ALTER TABLE books ADD COLUMN year INTEGER", (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.log("Migration info (year):", err.message);
        }
    });

    // Migration to add borrowed column if it doesn't exist
    db.run("ALTER TABLE books ADD COLUMN borrowed INTEGER DEFAULT 0", (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.log("Migration info (borrowed):", err.message);
        }
    });
});

// Endpoints
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Convert read and borrowed from 0/1 to boolean
        const formattedBooks = rows.map(b => ({
            ...b,
            read: !!b.read,
            borrowed: !!b.borrowed
        }));
        res.json(formattedBooks);
    });
});

app.post('/api/books', (req, res) => {
    const { id, title, author, isbn, pages, read, summary, genre, year, borrowed } = req.body;
    const sql = `
    INSERT INTO books (id, title, author, isbn, pages, read, summary, genre, year, borrowed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    db.run(sql, [id, title, author, isbn, pages, read ? 1 : 0, summary, genre, year, borrowed ? 1 : 0], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json(req.body);
    });
});

app.put('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, pages, read, summary, genre, year, borrowed } = req.body;
    const sql = `
    UPDATE books 
    SET title = ?, author = ?, isbn = ?, pages = ?, read = ?, summary = ?, genre = ?, year = ?, borrowed = ?
    WHERE id = ?
  `;
    db.run(sql, [title, author, isbn, pages, read ? 1 : 0, summary, genre, year, borrowed ? 1 : 0, id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(req.body);
    });
});

app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM books WHERE id = ?', [id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(204).send();
    });
});

app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
    console.log(`📚 Base de datos: ${dbPath}`);
});
