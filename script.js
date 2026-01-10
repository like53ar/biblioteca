/**
 * Library Management Application Logic
 */

// Book Class: Represents a book
class Book {
    constructor(title, author, isbn, pages, read, summary) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.pages = pages;
        this.read = read;
        this.summary = summary || '';
        this.id = Date.now().toString(); // Simple unique ID
    }
}

// UI Class: Handle UI Tasks
class UI {
    static displayBooks(filter = '') {
        const books = Store.getBooks();
        const list = document.querySelector('.books-grid');
        list.innerHTML = ''; // Clear current list

        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(filter.toLowerCase()) ||
            book.author.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredBooks.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <p>📚 ${filter ? 'No se encontraron resultados.' : 'No hay libros en tu biblioteca aún.'}</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem">${filter ? 'Prueba con otra búsqueda.' : '¡Agrega uno usando el formulario!'}</p>
                </div>
            `;
            return;
        }

        filteredBooks.forEach((book) => UI.addBookToList(book));
    }

    static addBookToList(book) {
        const list = document.querySelector('.books-grid');

        // Remove empty state if it exists
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const bookEl = document.createElement('div');
        bookEl.classList.add('book-card');
        if (book.read) bookEl.classList.add('is-read');

        bookEl.innerHTML = `
            <div class="book-info">
                <div class="book-header">
                    <h3>${book.title}</h3>
                    <span class="read-status-badge">${book.read ? '✅ Leído' : '📖 Pendiente'}</span>
                </div>
                <p><strong>Autor:</strong> ${book.author}</p>
                <div class="book-meta">
                    <p><strong>ISBN:</strong> ${book.isbn}</p>
                    <p><strong>Páginas:</strong> ${book.pages || 'N/A'}</p>
                </div>
                ${book.summary ? `<p class="book-summary">"${book.summary}"</p>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn-toggle-read" data-id="${book.id}">
                    ${book.read ? 'Marcar Pendiente' : 'Marcar Leído'}
                </button>
                <button class="btn-delete" data-id="${book.id}">
                    🗑️
                </button>
            </div>
        `;

        list.appendChild(bookEl);
    }

    static deleteBook(el) {
        if (el.classList.contains('btn-delete')) {
            // Traverse up to the card then remove
            el.closest('.book-card').style.opacity = '0';
            el.closest('.book-card').style.transform = 'scale(0.9)';

            setTimeout(() => {
                el.closest('.book-card').remove();
                // Check if empty again
                const books = Store.getBooks();
                if (books.length === 0) {
                    UI.displayBooks(); // Will show empty state
                }
            }, 300);
        }
    }

    static showAlert(message, className) {
        // Create div
        const div = document.createElement('div');
        div.className = `alert ${className}`;
        div.appendChild(document.createTextNode(message));

        const container = document.querySelector('.form-container');
        const form = document.querySelector('#book-form');

        container.insertBefore(div, form);

        // Vanish in 3 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static clearFields() {
        document.querySelector('#title').value = '';
        document.querySelector('#author').value = '';
        document.querySelector('#isbn').value = '';
        document.querySelector('#pages').value = '';
        document.querySelector('#summary').value = '';
        document.querySelector('#read').checked = false;
    }

    static async fetchBookByISBN(isbn) {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (cleanISBN.length < 10) return;

        const isbnInput = document.querySelector('#isbn');
        const container = isbnInput.closest('.form-group');

        try {
            container.classList.add('loading-field');

            let bookFound = false;
            let title = '', author = '', pages = '', summary = '';

            // 1. Try Google Books
            let response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`);
            let data = await response.json();

            if (data.items && data.items.length > 0) {
                const info = data.items[0].volumeInfo;
                title = info.title;
                author = info.authors ? info.authors.join(', ') : '';
                pages = info.pageCount;
                summary = info.description;
                bookFound = true;
                UI.showAlert('Datos encontrados (Google Books)', 'success');
            } else {
                // 2. Fallback to Open Library
                response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
                data = await response.json();
                const bookKey = `ISBN:${cleanISBN}`;

                if (data[bookKey]) {
                    const info = data[bookKey];
                    title = info.title;
                    author = info.authors ? info.authors.map(a => a.name).join(', ') : '';
                    pages = info.number_of_pages;
                    summary = info.notes || info.comment;
                    bookFound = true;
                    UI.showAlert('Datos encontrados (Open Library)', 'success');
                }
            }

            if (bookFound) {
                // If summary is missing, try Wikipedia
                if (!summary && title) {
                    summary = await this.fetchSummaryFromWikipedia(title);
                }

                this.populateFields({ title, author, pages, summary });
            } else if (cleanISBN.length === 10 || cleanISBN.length === 13) {
                UI.showAlert('No se encontraron datos en las bases globales', 'error');
            }

        } catch (error) {
            console.error('Error fetching ISBN:', error);
            UI.showAlert('Error al conectar con los servicios', 'error');
        } finally {
            container.classList.remove('loading-field');
        }
    }

    static async fetchSummaryFromWikipedia(title) {
        try {
            // Try Spanish Wikipedia first
            const lang = 'es';
            const searchUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            const response = await fetch(searchUrl);
            const data = await response.json();

            if (data.extract) {
                return data.extract;
            }
        } catch (e) {
            console.warn('Wikipedia fetch failed:', e);
        }
        return '';
    }

    static populateFields({ title, author, pages, summary }) {
        if (title) document.querySelector('#title').value = title;
        if (author) document.querySelector('#author').value = author;
        if (pages) document.querySelector('#pages').value = pages;
        if (summary) document.querySelector('#summary').value = summary;
    }
}

// Store Class: Handles Storage
class Store {
    static getBooks() {
        let books;
        if (localStorage.getItem('books') === null) {
            books = [];
        } else {
            books = JSON.parse(localStorage.getItem('books'));
        }
        return books;
    }

    static addBook(book) {
        const books = Store.getBooks();
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
    }

    static removeBook(id) {
        const books = Store.getBooks();
        const newBooks = books.filter(book => book.id !== id);
        localStorage.setItem('books', JSON.stringify(newBooks));
    }

    static toggleReadStatus(id) {
        const books = Store.getBooks();
        books.forEach(book => {
            if (book.id === id) {
                book.read = !book.read;
            }
        });
        localStorage.setItem('books', JSON.stringify(books));
    }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);

// Event: Add a Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
    // Prevent actual submit
    e.preventDefault();

    // Get form values
    const title = document.querySelector('#title').value;
    const author = document.querySelector('#author').value;
    const isbn = document.querySelector('#isbn').value;
    const pages = document.querySelector('#pages').value;
    const summary = document.querySelector('#summary').value;
    const read = document.querySelector('#read').checked;

    // Validate
    if (title === '' || author === '' || isbn === '') {
        UI.showAlert('Por favor completa los campos principales', 'error');
    } else {
        // Instantiate book
        const book = new Book(title, author, isbn, pages, read, summary);

        // Add Book to UI
        UI.addBookToList(book);

        // Add book to store
        Store.addBook(book);

        // Show success message
        UI.showAlert('Libro Agregado', 'success');

        // Clear fields
        UI.clearFields();
    }
});

// Event: Search Filter
document.querySelector('#search-input').addEventListener('input', (e) => {
    UI.displayBooks(e.target.value);
});

// Event: Remove or Toggle Read Status
document.querySelector('.books-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.getAttribute('data-id');
        UI.deleteBook(e.target);
        Store.removeBook(id);
        UI.showAlert('Libro Eliminado', 'success');
    }

    if (e.target.classList.contains('btn-toggle-read')) {
        const id = e.target.getAttribute('data-id');
        Store.toggleReadStatus(id);
        UI.displayBooks(document.querySelector('#search-input').value);
    }
});

// Event: ISBN Auto-fill
document.querySelector('#isbn').addEventListener('input', (e) => {
    const val = e.target.value.replace(/[-\s]/g, '');
    if (val.length === 10 || val.length === 13) {
        UI.fetchBookByISBN(e.target.value);
    }
});

document.querySelector('#btn-fetch-isbn').addEventListener('click', () => {
    const isbn = document.querySelector('#isbn').value;
    if (isbn) {
        UI.fetchBookByISBN(isbn);
    } else {
        UI.showAlert('Ingresa un ISBN primero', 'error');
    }
});
