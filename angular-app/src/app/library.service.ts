import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from './book.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LibraryService {
    private readonly STORAGE_KEY = 'angular_books';
    private readonly API_URL = 'http://localhost:3000/api/books';
    private http = inject(HttpClient);
    private booksSignal = signal<Book[]>([]);
    private migrated = signal(false);

    books = computed(() => this.booksSignal());

    constructor() {
        this.initializeBooks();
    }

    private async initializeBooks() {
        try {
            // Try to load from backend first
            const backendBooks = await firstValueFrom(this.http.get<Book[]>(this.API_URL));

            // If backend is empty, check localStorage for migration
            if (backendBooks.length === 0 && !this.migrated()) {
                const localBooks = this.loadFromLocalStorage();
                if (localBooks.length > 0) {
                    console.log('📦 Migrando libros desde localStorage a la base de datos...');
                    // Migrate each book to backend
                    for (const book of localBooks) {
                        await firstValueFrom(this.http.post(this.API_URL, book));
                    }
                    this.migrated.set(true);
                    // Clear localStorage after successful migration
                    localStorage.removeItem(this.STORAGE_KEY);
                    console.log('✅ Migración completada');
                    // Reload from backend
                    const migratedBooks = await firstValueFrom(this.http.get<Book[]>(this.API_URL));
                    this.booksSignal.set(migratedBooks);
                } else {
                    this.booksSignal.set([]);
                }
            } else {
                this.booksSignal.set(backendBooks);
            }

            // Verify and fix ISBN format for existing books
            // Verify and fix ISBN format and backfill years
            await this.repairBookMetadata();
        } catch (error) {
            console.error('❌ Error conectando con el servidor. Usando localStorage como fallback.', error);
            // Fallback to localStorage if backend is not available
            this.booksSignal.set(this.loadFromLocalStorage());
        }
    }

    private loadFromLocalStorage(): Book[] {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
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
                const metadata = await this.fetchBookByISBN(clean); // Use clean ISBN
                if (metadata && metadata.year) {
                    updated.year = metadata.year;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                console.log(`Updating metadata for ${book.title}...`);
                try {
                    await firstValueFrom(this.http.put(`${this.API_URL}/${book.id}`, updated));
                    this.booksSignal.update(prev => prev.map(b => b.id === book.id ? updated : b));
                    changed = true;
                } catch (e) {
                    console.error(`Failed to update metadata for ${book.title}`, e);
                }
            }
        }

        if (changed) {
            console.log('✅ Metadatos de libros actualizados correctamente');
        }
    }

    async addBook(book: Book) {
        try {
            await firstValueFrom(this.http.post(this.API_URL, book));
            this.booksSignal.update(prev => [...prev, book]);
        } catch (error) {
            console.error('Error adding book:', error);
            // Fallback to localStorage
            this.booksSignal.update(prev => {
                const updated = [...prev, book];
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    }

    async updateBook(book: Book) {
        try {
            await firstValueFrom(this.http.put(`${this.API_URL}/${book.id}`, book));
            this.booksSignal.update(prev => prev.map(b => b.id === book.id ? book : b));
        } catch (error) {
            console.error('Error updating book:', error);
            // Fallback to localStorage
            this.booksSignal.update(prev => {
                const updated = prev.map(b => b.id === book.id ? book : b);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    }

    async deleteBook(id: string) {
        try {
            await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
            this.booksSignal.update(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting book:', error);
            // Fallback to localStorage
            this.booksSignal.update(prev => {
                const updated = prev.filter(b => b.id !== id);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    }

    async toggleReadStatus(id: string) {
        const book = this.booksSignal().find(b => b.id === id);
        if (book) {
            const updatedBook = { ...book, read: !book.read };
            await this.updateBook(updatedBook);
        }
    }

    async fetchBookByISBN(isbn: string): Promise<Partial<Book> | null> {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (cleanISBN.length < 10) return null;

        let result = await this.fetchGoogleBooks(cleanISBN);
        if (result) return result;

        result = await this.fetchOpenLibraryBooksAPI(cleanISBN);
        if (result) return result;

        result = await this.fetchOpenLibrarySearch(cleanISBN);
        if (result) return result;

        return await this.fetchCrossref(cleanISBN);
    }

    private async fetchGoogleBooks(isbn: string): Promise<Partial<Book> | null> {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const info = data.items[0].volumeInfo;
                let summary = info.description || '';

                if (!summary) {
                    summary = await this.fetchWikipediaSummary(info.title);
                }

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
                let summary = info.notes || info.comment || info.excerpts?.[0]?.text || '';

                if (!summary) {
                    summary = await this.fetchWikipediaSummary(info.title);
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
                let summary = ''; // Search API rarely returns full summaries

                if (!summary) {
                    summary = await this.fetchWikipediaSummary(info.title);
                }

                return {
                    title: info.title,
                    author: info.author_name ? info.author_name.join(', ') : '',
                    pages: info.number_of_pages_median || undefined, // Search API often uses median
                    summary: summary,
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
                
                // Crossref returns varying structures, checking relevance
                if (item.ISBN && item.ISBN.some((i: string) => i.replace(/-/g, '') === isbn)) {
                     let summary = item.abstract || '';
                     
                     // Clean up abstract XML tags if present (common in Crossref)
                     summary = summary.replace(/<[^>]*>/g, '');

                     if (!summary) {
                        summary = await this.fetchWikipediaSummary(item.title[0]);
                     }

                    return {
                        title: item.title ? item.title[0] : '',
                        author: item.author ? item.author.map((a: any) => `${a.given} ${a.family}`).join(', ') : '',
                        pages: undefined, // Crossref often lacks page counts for books
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

    private async fetchWikipediaSummary(title: string): Promise<string> {
        try {
            const response = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
            const data = await response.json();
            return data.extract || '';
        } catch {
            return '';
        }
    }
}
