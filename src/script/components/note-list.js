import Notes from '../data/local/notesData.js';

class NoteList extends HTMLElement {
    _shadowRoot = null;
    _style = null;
    _column = 2;
    _gutter = 16;

    static get observedAttributes() {
        return ['column', 'gutter'];
    }

    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._style = document.createElement('style');
    }

    _updateStyle() {
        this._style.textContent = `
            :host {
                display: block;
                width: 100%;
                padding: 16px;
                box-sizing: border-box;
            }

            .note-list {
                margin-top: 5rem;

                display: grid;
                grid-template-columns: repeat(${this._column}, 1fr);
                gap: ${this._gutter}px;
            }

             @media screen and (max-width: 768px) {
                .note-list {
                    margin-top: 7rem;
                    grid-template-columns: 1fr;
                }
            }
        `;
    }

    _emptyContent() {
        this._shadowRoot.innerHTML = '';
    }

    set column(value) {
        const newValue = Number(value);
        if (!Number.isInteger(newValue)) return;
        this._column = newValue;
    }

    get column() {
        return this._column;
    }

    set gutter(value) {
        const newValue = Number(value);
        if (!Number.isInteger(newValue)) return;
        this._gutter = newValue;
    }

    get gutter() {
        return this._gutter;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'column':
                this.column = newValue;
                break;
            case 'gutter':
                this.gutter = newValue;
                break;
        }

        this.render();
    }

    connectedCallback() {
        this._initializeNotes();
        this.render();

        document.addEventListener('notesChanged', () => {
            this.render();
        });

        const searchBar = document.querySelector('app-bar');
        if (searchBar) {
            const searchForm = searchBar.shadowRoot.querySelector('#searchForm');
            if (searchForm) {
                searchForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const searchInput = searchForm.querySelector('input[name="name"]');
                    if (searchInput) {
                        const searchKeyword = searchInput.value.trim();
                        this.render(searchKeyword);
                    }
                });
            }
        }
    }

    _initializeNotes() {
        if (!localStorage.getItem('notes')) {
            const notes = Notes.getAll();
            localStorage.setItem('notes', JSON.stringify(notes));
        }
    }
    _searchNotes(keyword) {
        const notes = this._loadNotes();
        return notes.filter(note =>
            note.title.toLowerCase().includes(keyword.toLowerCase()) ||
            note.body.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    _loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return notes;
    }

    render(searchKeyword = '') {
        const notes = searchKeyword ? this._searchNotes(searchKeyword) : this._loadNotes();

        this._emptyContent();
        this._updateStyle();
        this._shadowRoot.appendChild(this._style);

        const noteListContainer = document.createElement('div');
        noteListContainer.classList.add('note-list');

        notes.forEach(note => {
            const noteElement = document.createElement('note-item');
            noteElement.note = note;
            noteListContainer.appendChild(noteElement);
        });

        this._shadowRoot.appendChild(noteListContainer);
    }
}

customElements.define('note-list', NoteList);
