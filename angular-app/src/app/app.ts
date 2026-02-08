import { Component, signal, computed, inject, effect, ViewChild, ElementRef } from '@angular/core';
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
        <div class="data-actions">
            <button class="btn-text-zen-small" (click)="uploadInput.click()">Importar JSON</button>
            <button class="btn-text-zen-small" (click)="exportData('json')">Exportar JSON</button>
            <button class="btn-text-zen-small" (click)="exportData('csv')">Exportar CSV</button>
        </div>
        <input #uploadInput type="file" (change)="onFileSelected($event)" accept=".json" style="display: none;">
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
              <input type="text" #isbnInput id="isbn" name="isbn" [(ngModel)]="formState().isbn" 
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

          <div class="zen-grid" style="grid-template-columns: 0.6fr 1.2fr 0.6fr 1.2fr; gap: 3rem;">
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
              <label for="year">Año</label>
              <input type="number" id="year" name="year" [(ngModel)]="formState().year" 
                     class="zen-input" placeholder="Ej. 2024">
            </div>
            <div class="input-group">
              <label>Estado y Formato <span style="color: var(--color-accent); font-weight: normal; font-size: 0.85em;">*</span></label>
              <div class="zen-checkbox">
                <input type="checkbox" id="read" name="read" [(ngModel)]="formState().read">
                <span style="font-size: 0.95rem; font-weight: 500;">Leído</span>
              </div>
              <div class="zen-checkbox">
                <input type="checkbox" id="borrowed" name="borrowed" [(ngModel)]="formState().borrowed">
                <span style="font-size: 0.95rem; font-weight: 500;">Prestado</span>
              </div>
               <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                <div class="zen-checkbox">
                    <input type="checkbox" id="isPaper" name="isPaper" [(ngModel)]="formState().isPaper">
                    <span style="font-size: 0.95rem; font-weight: 500;">Papel</span>
                </div>
                <div class="zen-checkbox">
                    <input type="checkbox" id="isDigital" name="isDigital" [(ngModel)]="formState().isDigital">
                    <span style="font-size: 0.95rem; font-weight: 500;">Digital</span>
                </div>
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
            } @else {
               <button type="button" (click)="resetForm()" class="btn-zen-secondary" style="margin-top: 0;">
                Limpiar
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

        <div class="book-grid-zen">
          @for (book of filteredBooks(); track book.id) {
            <article class="book-item-zen">
              <div class="item-header">
                <h3>{{ book.title }}</h3>
                <span class="badge-zen">
                  {{ book.read ? 'LEÍDO' : 'PENDIENTE' }}
                </span>
                @if (book.borrowed) {
                  <span class="badge-zen" style="margin-left: 0.5rem; border-color: #fca5a5; color: #fca5a5;">
                    PRESTADO
                  </span>
                }
                @if (book.isPaper) {
                    <span class="badge-zen" style="margin-left: 0.5rem; border-color: #a5f3fc; color: #a5f3fc;">
                    PAPEL
                  </span>
                }
                @if (book.isDigital) {
                    <span class="badge-zen" style="margin-left: 0.5rem; border-color: #c4b5fd; color: #c4b5fd;">
                    DIGITAL
                  </span>
                }
              </div>
              
              <div class="item-author">{{ book.author }}</div>

              <div class="item-meta">
                <span>ISBN <strong>{{ book.isbn }}</strong></span>
                <span>GÉNERO <strong>{{ book.genre || 'S/D' }}</strong></span>
                <span>PÁGS <strong>{{ book.pages || 'S/D' }}</strong></span>
                <span>AÑO DE EDICIÓN <strong>{{ book.year || 'S/D' }}</strong></span>
              </div>

              @if (book.summary) {
                <p class="item-summary">{{ book.summary }}</p>
              }

              <div class="item-actions">
                <button class="btn-item-action" (click)="editBook(book)">
                   Ver/Editar
                </button>
                <button class="btn-item-action" (click)="library.toggleReadStatus(book.id)">
                   {{ book.read ? 'Marcar Pendiente' : 'Marcar Leído' }}
                </button>
                <button class="btn-item-action" (click)="toggleBorrowed(book)">
                   {{ book.borrowed ? 'Marcar Devuelto' : 'Marcar Prestado' }}
                </button>
                <button class="btn-item-action btn-danger" (click)="library.deleteBook(book.id)">
                   Eliminar
                </button>
              </div>
            </article>
          } @empty {
            <div style="grid-column: 1 / -1; text-align: center; padding: 10rem 0; color: var(--text-muted);">
              <p style="font-size: 1.2rem; font-style: italic;">La biblioteca está en silencio.</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .data-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
    }
    .btn-text-zen-small {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    .btn-text-zen-small:hover {
        opacity: 1;
        color: var(--color-accent);
    }
  `],
})

export class App {
  library = inject(LibraryService);

  @ViewChild('isbnInput') isbnInput!: ElementRef;

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
    year?: number;
    borrowed: boolean;
    isPaper: boolean;
    isDigital: boolean;
  }>({
    title: '',
    author: '',
    isbn: '',
    pages: '',
    read: false,
    summary: '',
    genre: '',
    year: undefined,
    borrowed: false,
    isPaper: false,
    isDigital: false
  });

  totalBooks = computed(() => this.library.books().length);

  filteredBooks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const books = this.library.books().filter(b =>
      b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );

    return books.sort((a, b) => {
      const yearA = a.year || -1;
      const yearB = b.year || -1;
      // Sort descending (newest first)
      // Books without year (-1) go to the bottom
      if (yearA === -1 && yearB === -1) return 0;
      if (yearA === -1) return 1;
      if (yearB === -1) return -1;
      return yearB - yearA;
    });
  });

  onIsbnInput() {
    let value = this.formState().isbn.replace(/\D/g, '');

    // Limit to 13 digits
    if (value.length > 13) {
      value = value.substring(0, 13);
    }

    // Apply strict format: XXX-XXX-XXX-XXX-X
    let formatted = '';
    if (value.length > 0) formatted += value.substring(0, 3);
    if (value.length > 3) formatted += '-' + value.substring(3, 6);
    if (value.length > 6) formatted += '-' + value.substring(6, 9);
    if (value.length > 9) formatted += '-' + value.substring(9, 12);
    if (value.length > 12) formatted += '-' + value.substring(12, 13);

    this.formState.update(s => ({ ...s, isbn: formatted }));

    // Trigger fetch if we have a full ISBN (13 digits raw)
    if (value.length === 13 || value.length === 10) {
      // Check for duplicates before fetching
      const duplicate = this.library.books().find(b => b.isbn.replace(/\D/g, '') === value);
      if (duplicate) {
        alert(`⚠️ El libro con ISBN ${value} ya existe en la biblioteca:\n"${duplicate.title}"`);
        return;
      }

      this.fetchBook(value);
    }
  }

  async manualFetch() {
    const rawIsbn = this.formState().isbn.replace(/\D/g, '');

    // Check for duplicates
    const duplicate = this.library.books().find(b => b.isbn.replace(/\D/g, '') === rawIsbn);
    if (duplicate) {
      alert(`⚠️ El libro con ISBN ${rawIsbn} ya existe en la biblioteca:\n"${duplicate.title}"`);
      return;
    }

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
        summary: data.summary || prev.summary,
        year: data.year || prev.year,
        // Keep existing borrowed status or default to false
        borrowed: prev.borrowed,
        isPaper: prev.isPaper,
        isDigital: prev.isDigital
      }));
    }
    this.isLoading.set(false);
  }

  async addBook(event: Event) {
    event.preventDefault();
    const state = this.formState();
    if (state.title && state.author && state.isbn) {
      // Validation: Must be Paper or Digital
      if (!state.isPaper && !state.isDigital) {
        alert('⚠️ Por favor, indique si el libro es formato Papel o Digital (o ambos) antes de continuar.');
        return;
      }

      // Safeguard: Check for duplicates before saving
      const cleanIsbn = state.isbn.replace(/\D/g, '');
      const duplicate = this.library.books().find(b =>
        b.isbn.replace(/\D/g, '') === cleanIsbn && b.id !== (this.editingBookId() || '')
      );

      if (duplicate) {
        alert(`⚠️ No se puede guardar. El libro con ISBN ${cleanIsbn} ya existe:\n"${duplicate.title}"`);
        return;
      }

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
          genre: state.genre,
          year: state.year,
          borrowed: state.borrowed,
          isPaper: state.isPaper,
          isDigital: state.isDigital
        };
        await this.library.addBook(newBook);
      }
      this.resetForm();
      setTimeout(() => this.isbnInput.nativeElement.focus(), 0);
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
      genre: book.genre,
      year: book.year,
      borrowed: !!book.borrowed,
      isPaper: !!book.isPaper,
      isDigital: !!book.isDigital
    });
    if (book.summary) this.showSummaryField.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingBookId.set(null);
    this.resetForm();
  }

  public resetForm() {
    this.formState.set({
      title: '',
      author: '',
      isbn: '',
      pages: '',
      read: false,
      summary: '',
      genre: '',
      year: undefined,
      borrowed: false,
      isPaper: false,
      isDigital: false
    });
  }

  async toggleBorrowed(book: Book) {
    await this.library.updateBook({
      ...book,
      borrowed: !book.borrowed
    });
  }

  exportData(format: 'json' | 'csv') {
    this.library.exportBooks(format);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.library.importBooks(file);
    }
  }
}
