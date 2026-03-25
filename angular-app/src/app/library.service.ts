import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from './book.model';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class LibraryService {
    private readonly API_URL = '/api/books';
    private http = inject(HttpClient);
    private storage = inject(StorageService);
    private booksSignal = signal<Book[]>([]);
    public isLoaded = signal(false);

    public books = computed(() => this.booksSignal());

    constructor() {
        this.initializeBooks();
    }

    private async initializeBooks() {
        try {
            const backendBooks = await firstValueFrom(this.http.get<Book[]>(this.API_URL));
            this.booksSignal.set(backendBooks || []);
            await this.storage.saveBooks(backendBooks || []);
            this.isLoaded.set(true); // Allow app to show data while metadata repairs happen in background
            await this.repairBookMetadata();
        } catch (error) {
            console.error('❌ Error conectando con el servidor. Cargando desde IndexedDB.', error);
            const localBooks = await this.storage.getAllBooks();
            this.booksSignal.set(localBooks || []);
            this.isLoaded.set(true);
        }
    }

    public async repairBookMetadata() {
        const currentBooks = this.booksSignal();
        let changed = false;

        for (const book of currentBooks) {
            let needsUpdate = false;
            let updated = { ...book };

            const clean = book.isbn.replace(/\D/g, '');
            if (clean.length === 13) {
                const formatted = `${clean.substring(0, 3)}-${clean.substring(3, 6)}-${clean.substring(6, 9)}-${clean.substring(9, 12)}-${clean.substring(12, 13)}`;
                if (book.isbn !== formatted) {
                    updated.isbn = formatted;
                    needsUpdate = true;
                }
            }

            if (!book.year && clean.length >= 10) {
                const metadata = await this.fetchBookByISBN(clean);
                if (metadata && metadata.year) {
                    updated.year = metadata.year;
                    needsUpdate = true;
                }
            }

            if (book.isPaper === undefined && book.isDigital === undefined) {
                updated.isPaper = true;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await this.updateBook(updated);
                changed = true;
            }
        }

        if (changed) {
            console.log('✅ Metadatos de libros actualizados correctamente');
        }
    }

    public async addBook(book: Book) {
        this.booksSignal.update(prev => [...prev, book]);
        try {
            await firstValueFrom(this.http.post(this.API_URL, book));
            await this.storage.addBook(book);
        } catch (error) {
            console.error('Error adding book to server (Offline mode):', error);
            await this.storage.addBook(book);
        }
    }

    public async updateBook(book: Book) {
        this.booksSignal.update(prev => prev.map(b => b.id === book.id ? book : b));
        try {
            await firstValueFrom(this.http.put(`${this.API_URL}/${book.id}`, book));
            await this.storage.updateBook(book);
        } catch (error) {
            console.error('Error updating book on server (Offline mode):', error);
            await this.storage.updateBook(book);
        }
    }

    public async deleteBook(id: string) {
        this.booksSignal.update(prev => prev.filter(b => b.id !== id));
        try {
            await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
            await this.storage.deleteBook(id);
        } catch (error) {
            console.error('Error deleting book on server (Offline mode):', error);
            await this.storage.deleteBook(id);
        }
    }

    public async toggleReadStatus(id: string) {
        const book = this.booksSignal().find(b => b.id === id);
        if (book) {
            const updatedBook = { ...book, read: !book.read };
            await this.updateBook(updatedBook);
        }
    }

    public exportBooks(format: 'json' | 'csv') {
        const books = this.booksSignal();
        let content: string;
        let mimeType: string;
        let extension: string;

        if (format === 'json') {
            content = JSON.stringify(books, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        } else {
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

    public async importBooks(file: File) {
        const text = await file.text();
        let importedBooks: Book[] = [];

        try {
            if (file.name.endsWith('.json')) {
                importedBooks = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                alert('La importación de CSV es limitada. Por favor use JSON.');
                return;
            }

            if (!Array.isArray(importedBooks)) throw new Error('Formato inválido');

            for (const book of importedBooks) {
                const exists = this.booksSignal().find(b => b.id === book.id || b.isbn === book.isbn);
                if (!exists) {
                    await this.addBook(book);
                } else if (exists.id === book.id) {
                    await this.updateBook(book);
                }
            }
            alert('Sistema: Importación completada con éxito');
        } catch (e) {
            console.error('Import error:', e);
            alert('Error al importar el archivo.');
        }
    }

    public async fetchBookByISBN(isbn: string): Promise<Partial<Book> | null> {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (cleanISBN.length < 10) return null;

        let bestResult: Partial<Book> | null = null;
        const googleResult = await this.fetchGoogleBooks(cleanISBN);
        if (googleResult) bestResult = googleResult;

        if (!bestResult || !this.isValidSummary(bestResult.summary)) {
            const olResult = await this.fetchOpenLibraryBooksAPI(cleanISBN);
            if (olResult) {
                if (!bestResult) bestResult = olResult;
                else {
                    if (!this.isValidSummary(bestResult.summary) && this.isValidSummary(olResult.summary)) bestResult.summary = olResult.summary;
                    if (!bestResult.pages && olResult.pages) bestResult.pages = olResult.pages;
                    if (!bestResult.year && olResult.year) bestResult.year = olResult.year;
                }
            }
        }

        if (bestResult && bestResult.summary) {
            bestResult.summary = this.cleanSummary(bestResult.summary);
        }

        return bestResult;
    }

    private isValidSummary(summary?: string): boolean {
        if (!summary) return false;
        return this.cleanSummary(summary).length > 20;
    }

    private cleanSummary(text: string): string {
        if (!text) return '';
        let clean = text.replace(/<[^>]*>/g, '');
        const garbage = ["digitized by", "google books", "imported from", "includes bibliographical references"];
        if (garbage.some(g => clean.toLowerCase().includes(g))) return '';
        return clean.trim();
    }

    private async fetchGoogleBooks(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const info = data.items[0].volumeInfo;
                return {
                    title: info.title,
                    author: info.authors ? info.authors.join(', ') : '',
                    pages: info.pageCount,
                    summary: info.description || '',
                    year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined
                };
            }
        } catch (e) { console.error('Google Books error:', e); }
        return null;
    }

    private async fetchOpenLibraryBooksAPI(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            const data = await response.json();
            const bookKey = `ISBN:${isbn}`;
            if (data[bookKey]) {
                const info = data[bookKey];
                let summary = info.notes || info.comment || (info.excerpts ? info.excerpts[0].text : '');
                if (typeof summary === 'object') summary = (summary as any).value || '';
                return {
                    title: info.title,
                    author: info.authors ? info.authors.map((a: any) => a.name).join(', ') : '',
                    pages: info.number_of_pages,
                    summary: summary as string,
                    year: info.publish_date ? parseInt(info.publish_date.match(/\d{4}/)?.[0] || '0') : undefined
                };
            }
        } catch (e) { console.error('Open Library error:', e); }
        return null;
    }
}
