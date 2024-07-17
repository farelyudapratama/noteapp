class AppBar extends HTMLElement {
  _shadowRoot = null;
  _style = null;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
  }

  _updateStyle() {
    this._style.textContent = `
        :host {
          display: block;
          width: 100%;
          color: red;
          box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2);
          position: fixed;
          top: 0;
          z-index: 100;
        }

        .app-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 3rem;
            padding: 10px 20px;
            background-color: white;
        }

        .brand-name {
            margin: 0;
            font-size: 1.7em;
            color: #333;
        }

        .search-form {
            display: flex;
            align-items: center;
            gap: 10px;
            position: relative;
        }

        .search-form input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 20px;
            font-size: 1rem;
            width: 300px;
            box-sizing: border-box;
        }

        .search-form label {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background-color: white;
            padding: 0 4px;
            color: #aaa;
            transition: 0.2s ease all;
            pointer-events: none;
        }

        .search-form input:focus + label,
        .search-form input:not(:placeholder-shown) + label {
            top: 0;
            left: 10px;
            font-size: 0.8rem;
            color: #333;
        }

        .search-form button, .add-note-button, .archive-button {
            border: 0;
            padding: 8px 16px;
            background-color: cornflowerblue;
            text-transform: uppercase;
            font-size: 1rem;
            color: white;
            cursor: pointer;
            transition: background-color 100ms linear;
            border-radius: 25px;
        }

        .search-form button:hover {
            background-color: #4485ff;
        }

        .search-form button:active {
            background-color: #6c9aee;
        }
        .add-note-button {
            background-color: #e65f21;
        }
        .add-note-button:hover{
            background-color: #d44b0b;
        }

        .archive-button {
            background-color: #16941c;
            position: fixed;
            bottom: 60px;
            left: 10px;
            z-index: 100;
        }

        @media screen and (max-width: 768px) {
            .app-bar {
                flex-direction: column;
                padding: 10px 10px 40px 10px;
            }
            .add-note-button {
                position: fixed;
                bottom: 60px;
                right: 10px;
                z-index: 100;
                display: block;
            }
        }
        
        @media screen and (max-width: 480px) {
            .search-form input {
                width: 200px;
            }
        }

        `;
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  connectedCallback() {
    this.render();
    this._shadowRoot
      .querySelector(".add-note-button")
      .addEventListener("click", this._handleAddNoteClick.bind(this));
    this._shadowRoot
      .querySelector("#searchForm")
      .addEventListener("submit", this._handleSearchSubmit.bind(this));
    this._shadowRoot
      .querySelector(".archive-button")
      .addEventListener("click", this._handleArchiveToggle.bind(this));
  }

  _handleAddNoteClick() {
    const noteForm = document.querySelector("note-form");
    if (noteForm) {
      noteForm.style.display = "block";
    } else {
      const newNoteForm = document.createElement("note-form");
      document.body.appendChild(newNoteForm);
    }
  }

  _handleSearchSubmit(event) {
    event.preventDefault();
    // const searchInput = this._shadowRoot.querySelector('#name').value.toLowerCase();
    // const notes = JSON.parse(localStorage.getItem('notes')) || [];
    // const filteredNotes = notes.filter(note => {
    //     return note.title.toLowerCase().includes(searchInput) || note.body.toLowerCase().includes(searchInput);
    // });

    // const noteList = document.querySelector('note-list');
    // if (noteList) {
    //     noteList.updateList(filteredNotes);
    // }
  }
  _handleArchiveToggle() {
    const showArchived = !this.showArchived;
    this.showArchived = showArchived;
    document.dispatchEvent(
      new CustomEvent("toggleArchive", { detail: { showArchived } }),
    );
  }

  get showArchived() {
    return this._showArchived;
  }

  set showArchived(value) {
    this._showArchived = value;
    const archiveButton = this._shadowRoot.querySelector(".archive-button");
    if (archiveButton) {
      archiveButton.textContent = value ? "Hide Archive" : "Show Archive";
    }
  }

  render() {
    this._emptyContent();
    this._updateStyle();

    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.innerHTML += `      
        <div class="app-bar">
            <h1 class="brand-name">Notes App</h1>
            <form id="searchForm" class="search-form">
                <input id="name" name="name" type="search" placeholder=" " required />
                <label for="name">Search Notes</label>
                <button type="submit">Search</button>
            </form>
            <button class="archive-button">Show Archive</button>
            <button class="add-note-button">+ Add Note</button>
        </div>
      `;
  }
}

customElements.define("app-bar", AppBar);
