import { Injectable, signal, computed } from '@angular/core';
import { Book } from './book.model';

@Injectable({
    providedIn: 'root'
})
export class LibraryService {
    private readonly STORAGE_KEY = 'angular_books';
    private booksSignal = signal<Book[]>(this.loadBooks());

    books = computed(() => this.booksSignal());

    private loadBooks(): Book[] {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    addBook(book: Book) {
        this.booksSignal.update(prev => {
            const updated = [...prev, book];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }

    deleteBook(id: string) {
        this.booksSignal.update(prev => {
            const updated = prev.filter(b => b.id !== id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }

    toggleReadStatus(id: string) {
        this.booksSignal.update(prev => {
            const updated = prev.map(b => b.id === id ? { ...b, read: !b.read } : b);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }

    async fetchBookByISBN(isbn: string): Promise<Partial<Book> | null> {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (cleanISBN.length < 10) return null;

        try {
            // 1. Google Books
            let response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`);
            let data = await response.json();

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
                    summary: summary
                };
            }

            // 2. Open Library Fallback
            response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
            data = await response.json();
            const bookKey = `ISBN:${cleanISBN}`;

            if (data[bookKey]) {
                const info = data[bookKey];
                let summary = info.notes || info.comment || '';

                if (!summary) {
                    summary = await this.fetchWikipediaSummary(info.title);
                }

                return {
                    title: info.title,
                    author: info.authors ? info.authors.map((a: any) => a.name).join(', ') : '',
                    pages: info.number_of_pages,
                    summary: summary
                };
            }
        } catch (error) {
            console.error('ISBN Fetch error:', error);
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
