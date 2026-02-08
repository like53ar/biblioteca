import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from './book.model';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class LibraryService {
    private readonly API_URL = 'http://localhost:3000/api/books';
    private http = inject(HttpClient);
    private storage = inject(StorageService);
    private booksSignal = signal<Book[]>([]);

    books = computed(() => this.booksSignal());

    constructor() {
        this.initializeBooks();
    }

    private async initializeBooks() {
        try {
            // 1. Try to load from backend
            const backendBooks = await firstValueFrom(this.http.get<Book[]>(this.API_URL));

            // 2. If success, update state and cache to IndexedDB
            this.booksSignal.set(backendBooks);
            await this.storage.saveBooks(backendBooks);

            // 3. Verify and fix ISBN format for existing books
            await this.repairBookMetadata();

        } catch (error) {
            console.error('❌ Error conectando con el servidor. Cargando desde IndexedDB.', error);
            // 4. Fallback to IndexedDB if backend is not available
            const localBooks = await this.storage.getAllBooks();
            this.booksSignal.set(localBooks);
        }
    }

    async repairBookMetadata() {
        const currentBooks = this.booksSignal();
        let changed = false;

        for (const book of currentBooks) {
            let needsUpdate = false;
            let updated = { ...book };

            // 1. Fix ISBN Format
            const clean = book.isbn.replace(/\D/g, '');
            if (clean.length === 13) {
                const formatted = `${clean.substring(0, 3)}-${clean.substring(3, 6)}-${clean.substring(6, 9)}-${clean.substring(9, 12)}-${clean.substring(12, 13)}`;
                if (book.isbn !== formatted) {
                    updated.isbn = formatted;
                    needsUpdate = true;
                }
            }

            // 2. Backfill Year if missing
            if (!book.year && clean.length >= 10) {
                console.log(`Fetching missing year for: ${book.title}`);
                const metadata = await this.fetchBookByISBN(clean);
                if (metadata && metadata.year) {
                    updated.year = metadata.year;
                    needsUpdate = true;
                }
            }

            // 3. Backfill Format
            if (book.isPaper === undefined && book.isDigital === undefined) {
                updated.isPaper = true;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await this.updateBook(updated); // Uses the new update logic
                changed = true;
            }
        }

        if (changed) {
            console.log('✅ Metadatos de libros actualizados correctamente');
        }
    }

    async addBook(book: Book) {
        // Optimistic Update
        this.booksSignal.update(prev => [...prev, book]);

        try {
            await firstValueFrom(this.http.post(this.API_URL, book));
            await this.storage.addBook(book); // Sync local DB
        } catch (error) {
            console.error('Error adding book to server (Offline mode):', error);
            // Only save to local DB
            await this.storage.addBook(book);
        }
    }

    async updateBook(book: Book) {
        // Optimistic Update
        this.booksSignal.update(prev => prev.map(b => b.id === book.id ? book : b));

        try {
            await firstValueFrom(this.http.put(`${this.API_URL}/${book.id}`, book));
            await this.storage.updateBook(book); // Sync local DB
        } catch (error) {
            console.error('Error updating book on server (Offline mode):', error);
            // Only save to local DB
            await this.storage.updateBook(book);
        }
    }

    async deleteBook(id: string) {
        // Optimistic Update
        this.booksSignal.update(prev => prev.filter(b => b.id !== id));

        try {
            await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
            await this.storage.deleteBook(id); // Sync local DB
        } catch (error) {
            console.error('Error deleting book on server (Offline mode):', error);
            // Only update local DB
            await this.storage.deleteBook(id);
        }
    }

    async toggleReadStatus(id: string) {
        const book = this.booksSignal().find(b => b.id === id);
        if (book) {
            const updatedBook = { ...book, read: !book.read };
            await this.updateBook(updatedBook);
        }
    }

    // --- Export / Import ---

    exportBooks(format: 'json' | 'csv') {
        const books = this.booksSignal();
        let content: string;
        let mimeType: string;
        let extension: string;

        if (format === 'json') {
            content = JSON.stringify(books, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } else {
            // CSV Header
            const headers = ['id', 'title', 'author', 'isbn', 'pages', 'read', 'summary', 'genre', 'year', 'borrowed', 'isPaper', 'isDigital'];
            const rows = books.map(b => [
                JSON.stringify(b.id),
                JSON.stringify(b.title),
                JSON.stringify(b.author),
                JSON.stringify(b.isbn),
                b.pages,
                b.read,
                JSON.stringify(b.summary || ''),
                JSON.stringify(b.genre || ''),
                b.year || '',
                b.borrowed || false,
                b.isPaper || false,
                b.isDigital || false
            ].join(','));
            content = [headers.join(','), ...rows].join('\n');
            mimeType = 'text/csv';
            extension = 'csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `biblioteca_backup_${new Date().toISOString().split('T')[0]}.${extension}`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    async importBooks(file: File) {
        const text = await file.text();
        let importedBooks: Book[] = [];

        try {
            if (file.name.endsWith('.json')) {
                importedBooks = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                // Quick CSV parser warning
                alert('La importación de CSV es limitada (solo visualización). Por favor use JSON para restaurar copias de seguridad completas.');
                return;
            }

            if (!Array.isArray(importedBooks)) throw new Error('Formato inválido');

            console.log(`📥 Importando ${importedBooks.length} libros...`);

            for (const book of importedBooks) {
                // Check if exists
                const exists = this.booksSignal().find(b => b.id === book.id || b.isbn === book.isbn);
                if (!exists) {
                    await this.addBook(book);
                } else {
                    if (exists.id === book.id) {
                        await this.updateBook(book);
                    }
                }
            }
            alert('✅ Importación completada');

        } catch (e) {
            console.error('Import error:', e);
            alert('❌ Error al importar el archivo. Asegúrese de que sea un JSON válido.');
        }
    }


    // --- API Fetching Methods (Unchanged) ---

    async fetchBookByISBN(isbn: string): Promise<Partial<Book> | null> {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (cleanISBN.length < 10) return null;

        let bestResult: Partial<Book> | null = null;

        // 1. Google Books (Primary source for Metadata & Summary)
        const googleResult = await this.fetchGoogleBooks(cleanISBN);
        if (googleResult) {
            bestResult = googleResult;
        }

        // 2. Open Library (Secondary source, sometimes has better summaries or fills gaps)
        // If we don't have a result OR we don't have a good summary yet
        if (!bestResult || !this.isValidSummary(bestResult.summary)) {
            const olResult = await this.fetchOpenLibraryBooksAPI(cleanISBN);
            if (olResult) {
                if (!bestResult) {
                    bestResult = olResult;
                } else {
                    // Augmented Merge
                    if (!this.isValidSummary(bestResult.summary) && this.isValidSummary(olResult.summary)) {
                        bestResult.summary = olResult.summary;
                    }
                    if (!bestResult.pages && olResult.pages) bestResult.pages = olResult.pages;
                    if (!bestResult.year && olResult.year) bestResult.year = olResult.year;
                }
            }
        }

        // 3. Open Library Search (Fallback for metadata mostly, rarely has good summary)
        if (!bestResult) {
            const olSearchResult = await this.fetchOpenLibrarySearch(cleanISBN);
            if (olSearchResult) {
                bestResult = olSearchResult;
            }
        }

        // 4. Crossref (Last resort)
        if (!bestResult) {
            const crossrefResult = await this.fetchCrossref(cleanISBN);
            if (crossrefResult) {
                bestResult = crossrefResult;
            }
        }

        // Final cleanup
        if (bestResult) {
            if (bestResult.summary) {
                bestResult.summary = this.cleanSummary(bestResult.summary);
            }
            // If summary became empty after cleaning, set it to generic fallback or empty
            if (!bestResult.summary) bestResult.summary = '';
        }

        return bestResult;
    }

    private isValidSummary(summary?: string): boolean {
        if (!summary) return false;
        const clean = this.cleanSummary(summary);
        return clean.length > 20; // Ignore very short texts
    }

    private cleanSummary(text: string): string {
        if (!text) return '';

        let clean = text;

        // Remove HTML tags
        clean = clean.replace(/<[^>]*>/g, '');

        // Common garbage phrases in free APIs
        const garbagePhrases = [
            "This is a digital copy",
            "digitized by",
            "This book was",
            "Created by",
            "Imported from",
            "No description available",
            "Publisher's description",
            "Edition description",
            "Work description",
            "Table of Contents",
            "Includes bibliographical references",
            "Includes index",
            "Bibliography"
        ];

        // If the summary is just one of these phrases (or starts with it contextually poorly), kill it.
        // A simple check: if it contains "digitized by Google", assume it's garbage.
        if (clean.toLowerCase().includes('digitized by')) return '';
        if (clean.toLowerCase().includes('google books')) return '';
        if (clean.toLowerCase().includes('imported from')) return '';
        if (clean.toLowerCase().includes('includes bibliographical references')) return '';

        // Check if any garbage phrase is contained in the summary
        if (garbagePhrases.some(phrase => clean.trim().toLowerCase().includes(phrase.toLowerCase()))) {
            return '';
        }

        return clean.trim();
    }

    private async fetchGoogleBooks(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const info = data.items[0].volumeInfo;
                let summary = info.description || '';

                return {
                    title: info.title,
                    author: info.authors ? info.authors.join(', ') : '',
                    pages: info.pageCount,
                    summary: summary,
                    year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined
                };
            }
        } catch (error) {
            console.error('Google Books error:', error);
        }
        return null;
    }

    private async fetchOpenLibraryBooksAPI(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            const data = await response.json();
            const bookKey = `ISBN:${isbn}`;

            if (data[bookKey]) {
                const info = data[bookKey];
                let summary = info.notes || info.comment || '';

                // Excerpts sometimes useful, but often just snippets
                if (!summary && info.excerpts && info.excerpts.length > 0) {
                    summary = info.excerpts[0].text;
                }

                if (typeof summary === 'object' && summary !== null) {
                    summary = (summary as any).value || '';
                }

                return {
                    title: info.title,
                    author: info.authors ? info.authors.map((a: any) => a.name).join(', ') : '',
                    pages: info.number_of_pages,
                    summary: summary,
                    year: info.publish_date ? parseInt(info.publish_date.match(/\d{4}/)?.[0] || '0') : undefined
                };
            }
        } catch (error) {
            console.error('Open Library Books API error:', error);
        }
        return null;
    }

    private async fetchOpenLibrarySearch(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}`);
            const data = await response.json();

            if (data.docs && data.docs.length > 0) {
                const info = data.docs[0];

                return {
                    title: info.title,
                    author: info.author_name ? info.author_name.join(', ') : '',
                    pages: info.number_of_pages_median || undefined,
                    summary: '',
                    year: info.first_publish_year || (info.publish_year ? Math.min(...info.publish_year) : undefined)
                };
            }
        } catch (error) {
            console.error('Open Library Search API error:', error);
        }
        return null;
    }

    private async fetchCrossref(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://api.crossref.org/works?query=${isbn}&rows=1`);
            const data = await response.json();

            if (data.message && data.message.items && data.message.items.length > 0) {
                const item = data.message.items[0];

                if (item.ISBN && item.ISBN.some((i: string) => i.replace(/-/g, '') === isbn)) {
                    let summary = item.abstract || '';
                    summary = summary.replace(/<[^>]*>/g, '');

                    return {
                        title: item.title ? item.title[0] : '',
                        author: item.author ? item.author.map((a: any) => `${a.given} ${a.family}`).join(', ') : '',
                        pages: undefined,
                        summary: summary,
                        year: item.published ? item.published['date-parts'][0][0] : undefined
                    };
                }
            }
        } catch (error) {
            console.error('Crossref API error:', error);
        }
        return null;
    }
}
