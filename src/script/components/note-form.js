class NoteForm extends HTMLElement {
    _shadowRoot = null;
    _style = null;
    _noteId = null;

    constructor() {
        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._style = document.createElement('style');
    }

    _updateStyle() {
        this._style.textContent = `
            :host {
                display: none;
            }
            .popup {
                z-index: 100;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            .form-container {
                width: 100%;
                max-width: 80%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 20px;
                box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2);
                background-color: #f9f9f9;
                border-radius: 8px;
            }
            .form-group {
                display: flex;
                flex-direction: column;
            }
            .form-group label {
                margin: 10px 0;
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
            }
            .form-group input,
            .form-group textarea {
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 1rem;
                width: 100%;
                box-sizing: border-box;
            }
            .form-group textarea {
                resize: vertical;
                min-height: 100px;
            }
            .form-group button {
                margin-top: 16px;
                padding: 10px 20px;
                background-color: cornflowerblue;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            .form-group button:hover {
                background-color: #4485ff;
            }
            .form-group button:active {
                background-color: #6c9aee;
            }
            .error-message {
                color: red;
                font-size: 0.8rem;
                display: none;
            }
        `;
    }

    connectedCallback() {
        this.render();
        this._shadowRoot.querySelector('.popup').addEventListener('click', this._handleOutsideClick.bind(this));
        this._shadowRoot.querySelector('.form-container').addEventListener('click', (event) => {
            event.stopPropagation();
        });

        this._shadowRoot.querySelector('#title').addEventListener('input', () => this._validateInput('title'));
        this._shadowRoot.querySelector('#body').addEventListener('input', () => this._validateInput('body'));

        this._shadowRoot.querySelector('form').addEventListener('submit', this._handleSubmit.bind(this));
    }

    _handleOutsideClick(event) {
        if (event.target === this._shadowRoot.querySelector('.popup')) {
            this.style.display = 'none';
            this._emptyForm();
        }
    }

    _emptyForm() {
        this._shadowRoot.querySelector('#title').value = '';
        this._shadowRoot.querySelector('#body').value = '';
    }

    open(note = { id: null, title: '', body: '', createdAt: '' }, id = null) {
        this._noteId = id;
        this._shadowRoot.querySelector('#title').value = note.title;
        this._shadowRoot.querySelector('#body').value = note.body;
        this.style.display = 'block';
    }

    _validateInput(field) {
        const input = this._shadowRoot.querySelector(`#${field}`);
        const error = this._shadowRoot.querySelector(`#${field}Error`);
        let isValid = true;
        if (field === 'title' && input.value.length < 3) {
            this.showError(error, 'Title must be at least 3 characters long.');
            input.setCustomValidity('Title must be at least 3 characters long.');
            isValid = false;
        } else if (field === 'body' && input.value.length < 6) {
            this.showError(error, 'Body must be at least 6 characters long.');
            input.setCustomValidity('Body must be at least 6 characters long.');
            isValid = false;
        } else {
            this.hideError(error);
            input.setCustomValidity('');
        }

        return isValid
    }

    _handleSubmit(event) {
        event.preventDefault();

        const titleValid = this._validateInput('title');
        const bodyValid = this._validateInput('body');

        if (titleValid && bodyValid) {
            const title = this._shadowRoot.querySelector('#title').value;
            const body = this._shadowRoot.querySelector('#body').value;
            const createdAt = new Date().toISOString();
            const note = { id: this._noteId, title, body, createdAt };

            this._saveNoteToLocalStorage(note);
            this.style.display = 'none';
            this._emptyForm();
        }
    }

    _saveNoteToLocalStorage(note) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        if (note.id) {
            const existingNoteIndex = notes.findIndex(n => n.id === note.id);
            if (existingNoteIndex !== -1) {
                notes[existingNoteIndex] = note;
            }
        } else {
            note.id = `${Date.now()}`;
            notes.push(note);
        }
        localStorage.setItem('notes', JSON.stringify(notes));
        document.querySelector('note-list').render();
        document.dispatchEvent(new CustomEvent('notesChanged'));
    }

    showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    hideError(element) {
        element.textContent = '';
        element.style.display = 'none';
    }

    _emptyContent() {
        this._shadowRoot.innerHTML = '';
    }

    render() {
        this._emptyContent();
        this._updateStyle();

        this._shadowRoot.appendChild(this._style);
        this._shadowRoot.innerHTML += `
            <div class="popup">
                <div class="form-container">
                    <form>
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" placeholder="Enter note title" required />
                            <div class="error-message" id="titleError"></div>
                        </div>
                        <div class="form-group">
                            <label for="body">Body</label>
                            <textarea id="body" name="body" placeholder="Enter note body" required></textarea>
                            <div class="error-message" id="bodyError"></div>
                        </div>
                        <div class="form-group">
                            <button type="submit">Save Note</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}

customElements.define('note-form', NoteForm);
