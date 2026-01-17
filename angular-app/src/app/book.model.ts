export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    pages: number | string;
    read: boolean;
    summary: string;
    genre: string;
    year?: number;
}
