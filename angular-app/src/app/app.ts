import { Component, signal, computed, inject, effect } from '@angular/core';
import { LibraryService } from './library.service';
import { Book } from './book.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="zen-wrapper">
      <div class="stats-zen">
        Cant. Libros Disponibles: {{ totalBooks() }}
      </div>
      <header>
        <h1>Mi Biblioteca</h1>
        <p>El silencio de los libros es una forma de paz.</p>
      </header>

      <!-- Panel de Registro Zen -->
      <section class="zen-form-container">
        <form (submit)="addBook($event)" class="zen-form">
          
          <div class="input-group" [class.zen-loading]="isLoading()">
            <label for="isbn">Identificador ISBN</label>
            <div class="isbn-field">
              <input type="text" id="isbn" name="isbn" [(ngModel)]="formState().isbn" 
                     (input)="onIsbnInput()" class="zen-input" placeholder="Pulse para escribir...">
              <button type="button" (click)="manualFetch()" class="btn-zen-sync" title="Sincronizar">🔍</button>
            </div>
          </div>

          <div class="zen-grid" style="gap: 3rem;">
            <div class="input-group">
              <label for="title">Título de la Obra</label>
              <input type="text" id="title" name="title" [(ngModel)]="formState().title" 
                     class="zen-input" placeholder="Nombre completo">
            </div>
            <div class="input-group">
              <label for="author">Autoría</label>
              <input type="text" id="author" name="author" [(ngModel)]="formState().author" 
                     class="zen-input" placeholder="Persona que escribe">
            </div>
          </div>

          <div class="zen-grid" style="grid-template-columns: 0.5fr 1.5fr 1fr; gap: 2rem;">
            <div class="input-group">
              <label for="pages">Páginas</label>
              <input type="number" id="pages" name="pages" [(ngModel)]="formState().pages" 
                     class="zen-input" placeholder="0">
            </div>
            <div class="input-group">
              <label for="genre">Género</label>
              <select id="genre" name="genre" [(ngModel)]="formState().genre" class="zen-input zen-select">
                <option value=""></option>
                @for (g of genres; track g) {
                  <option [value]="g">{{ g }}</option>
                }
              </select>
            </div>
            <div class="input-group">
              <label>Estado</label>
              <div class="zen-checkbox">
                <input type="checkbox" id="read" name="read" [(ngModel)]="formState().read">
                <span style="font-size: 0.95rem; font-weight: 500;">Leído</span>
              </div>
            </div>
          </div>

          @if (!showSummaryField()) {
            <button type="button" class="btn-zen-secondary" (click)="showSummaryField.set(true)">
              + Añadir Resumen Personal
            </button>
          } @else {
            <div class="input-group" style="gap: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <label for="summary">Resumen Personal</label>
                <button type="button" class="btn-text-zen" (click)="showSummaryField.set(false)">Ocultar</button>
              </div>
              <textarea id="summary" name="summary" [(ngModel)]="formState().summary" 
                        class="zen-input" placeholder="Escriba aquí..." 
                        rows="2" style="resize: none; font-size: 1.1rem; line-height: 1.8;"></textarea>
            </div>
          }

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="submit" class="btn-zen-action" style="flex: 2; margin-top: 0;">
              {{ editingBookId() ? 'Actualizar Registro' : 'Incorporar a la Colección' }}
            </button>
            @if (editingBookId()) {
              <button type="button" (click)="cancelEdit()" class="btn-zen-secondary" style="margin-top: 0;">
                Cancelar
              </button>
            }
          </div>
        </form>
      </section>

      <!-- Vista de Biblioteca -->
      <section class="collection-zen">
        <h2>La Colección</h2>
        
        <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" 
               class="search-zen" placeholder="Buscar en el silencio...">

        <div style="display: flex; flex-direction: column;">
          @for (book of filteredBooks(); track book.id) {
            <article class="book-item-zen">
              <div class="item-header">
                <h3>{{ book.title }}</h3>
                <span class="badge-zen">
                  {{ book.read ? 'LEÍDO' : 'PENDIENTE' }}
                </span>
              </div>
              
              <div class="item-author">{{ book.author }}</div>

              <div class="item-meta">
                <span>ISBN <strong>{{ book.isbn }}</strong></span>
                <span>GÉNERO <strong>{{ book.genre || 'S/D' }}</strong></span>
                <span>EXTENSIÓN <strong>{{ book.pages || 'S/D' }}</strong></span>
              </div>

              @if (book.summary) {
                <p class="item-summary">{{ book.summary }}</p>
              }

              <div class="item-actions">
                <button class="btn-item-action" (click)="editBook(book)">
                   Ver/Editar
                </button>
                <button class="btn-item-action" (click)="library.toggleReadStatus(book.id)">
                   Cambiar a {{ book.read ? 'Pendiente' : 'Leído' }}
                </button>
                <button class="btn-item-action btn-danger" (click)="library.deleteBook(book.id)">
                   Remover Registro
                </button>
              </div>
            </article>
          } @empty {
            <div style="text-align: center; padding: 10rem 0; color: var(--text-muted);">
              <p style="font-size: 1.2rem; font-style: italic;">La biblioteca está en silencio.</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [],
})
export class App {
  library = inject(LibraryService);

  searchTerm = signal('');
  isLoading = signal(false);
  showSummaryField = signal(false);
  editingBookId = signal<string | null>(null);

  genres = [
    'Historia Universal',
    'Historia Política',
    'Historia Militar',
    'Historia Social',
    'Historia Cultural',
    'Historia Económica',
    'Microhistoria',
    'Biografía Histórica',
    'Historiografía',
    'Biografías',
    'Filosofía'
  ];

  formState = signal<{
    title: string;
    author: string;
    isbn: string;
    pages: string | number;
    read: boolean;
    summary: string;
    genre: string;
  }>({
    title: '',
    author: '',
    isbn: '',
    pages: '',
    read: false,
    summary: '',
    genre: ''
  });

  totalBooks = computed(() => this.library.books().length);

  filteredBooks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.library.books().filter(b =>
      b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  });

  onIsbnInput() {
    const isbn = this.formState().isbn.replace(/[-\s]/g, '');
    if (isbn.length === 10 || isbn.length === 13) {
      this.fetchBook(isbn);
    }
  }

  async manualFetch() {
    const isbn = this.formState().isbn;
    if (isbn) await this.fetchBook(isbn);
  }

  private async fetchBook(isbn: string) {
    this.isLoading.set(true);
    const data = await this.library.fetchBookByISBN(isbn);
    if (data) {
      this.formState.update(prev => ({
        ...prev,
        title: data.title || prev.title,
        author: data.author || prev.author,
        pages: data.pages || prev.pages,
        summary: data.summary || prev.summary
      }));
    }
    this.isLoading.set(false);
  }

  async addBook(event: Event) {
    event.preventDefault();
    const state = this.formState();
    if (state.title && state.author && state.isbn) {
      if (this.editingBookId()) {
        await this.library.updateBook({
          ...state,
          id: this.editingBookId()!
        });
        this.editingBookId.set(null);
      } else {
        const newBook: Book = {
          id: Date.now().toString(),
          title: state.title,
          author: state.author,
          isbn: state.isbn,
          pages: state.pages,
          read: state.read,
          summary: state.summary,
          genre: state.genre
        };
        await this.library.addBook(newBook);
      }
      this.resetForm();
    }
  }

  editBook(book: Book) {
    this.editingBookId.set(book.id);
    this.formState.set({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      pages: book.pages,
      read: book.read,
      summary: book.summary,
      genre: book.genre
    });
    if (book.summary) this.showSummaryField.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingBookId.set(null);
    this.resetForm();
  }

  private resetForm() {
    this.formState.set({
      title: '',
      author: '',
      isbn: '',
      pages: '',
      read: false,
      summary: '',
      genre: ''
    });
  }
}
