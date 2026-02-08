import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Book } from './book.model';

interface LibraryDB extends DBSchema {
    books: {
        key: string;
        value: Book;
    };
}

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private dbPromise: Promise<IDBPDatabase<LibraryDB>>;

    constructor() {
        this.dbPromise = openDB<LibraryDB>('library-db', 1, {
            upgrade(db) {
                db.createObjectStore('books', { keyPath: 'id' });
            },
        });
    }

    async getAllBooks(): Promise<Book[]> {
        return (await this.dbPromise).getAll('books');
    }

    async saveBooks(books: Book[]): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction('books', 'readwrite');
        const store = tx.objectStore('books');
        await store.clear();
        for (const book of books) {
            await store.put(book);
        }
        await tx.done;
    }

    async addBook(book: Book): Promise<void> {
        await (await this.dbPromise).put('books', book);
    }

    async updateBook(book: Book): Promise<void> {
        await (await this.dbPromise).put('books', book);
    }

    async deleteBook(id: string): Promise<void> {
        await (await this.dbPromise).delete('books', id);
    }
}
