// import Notes from '../data/local/notesData.js';
import NotesApi from "../data/remote/notesApi.js";
import "./loading-indicator.js";
import Swal from "sweetalert2";
import { gsap } from "gsap";

class NoteList extends HTMLElement {
  _shadowRoot = null;
  _style = null;
  _column = 2;
  _gutter = 16;

  static get observedAttributes() {
    return ["column", "gutter"];
  }

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
    this.showArchived = false;
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
    this._shadowRoot.innerHTML = "";
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
      case "column":
        this.column = newValue;
        break;
      case "gutter":
        this.gutter = newValue;
        break;
    }

    this.render();
  }

  connectedCallback() {
    // this._initializeNotes();
    this.render();

    document.addEventListener("notesChanged", () => {
      this.render();
    });
    document.addEventListener("toggleArchive", (event) => {
      this._showArchived = event.detail.showArchived;
      this.render();
    });
    const searchBar = document.querySelector("app-bar");
    if (searchBar) {
      const searchForm = searchBar.shadowRoot.querySelector("#searchForm");
      if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
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
  // _initializeNotes() {
  //     if (!localStorage.getItem('notes')) {
  //         const notes = Notes.getAll();
  //         localStorage.setItem('notes', JSON.stringify(notes));
  //     }
  // }
  // _searchNotes(keyword) {
  //     const notes = this._loadNotes();
  //     return notes.filter(note =>
  //         note.title.toLowerCase().includes(keyword.toLowerCase()) ||
  //         note.body.toLowerCase().includes(keyword.toLowerCase())
  //     );
  // }

  // _loadNotes() {
  //     const notes = JSON.parse(localStorage.getItem('notes')) || [];
  //     notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  //     return notes;
  // }

  async _searchNotes(keyword) {
    try {
      // const notes = await NotesApi.getNotes();
      // return notes.data.filter(note =>
      //     note.title.toLowerCase().includes(keyword.toLowerCase()) ||
      //     note.body.toLowerCase().includes(keyword.toLowerCase())
      // );
      let notes = [];

      if (this._showArchived) {
        const response = await NotesApi.getNotesArchive();
        notes = response.data.filter(
          (note) =>
            note.title.toLowerCase().includes(keyword.toLowerCase()) ||
            note.body.toLowerCase().includes(keyword.toLowerCase()),
        );
      } else {
        const allNotes = await this._loadNotes();
        notes = allNotes.filter(
          (note) =>
            !note.isArchived &&
            (note.title.toLowerCase().includes(keyword.toLowerCase()) ||
              note.body.toLowerCase().includes(keyword.toLowerCase())),
        );
      }

      return notes;
    } catch (error) {
      console.error("Error searching notes:", error);
      this.showErrorMessage("Error searching notes");
      return [];
    }
  }

  async _loadNotes() {
    try {
      if (this._showArchived) {
        console.log("show archived");
        const response = await NotesApi.getNotesArchive();
        return response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      } else {
        console.log("Hide Archived");
        const response = await NotesApi.getNotes();
        return response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      }
      // const response = await NotesApi.getNotes();
      // return response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      this.showErrorMessage("Error searching notes");
      console.error("Error loading notes:", error);
      return [];
    }
  }

  async render(searchKeyword = "") {
    const loadingIndicator = document.querySelector("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.show();
    }

    let notes = searchKeyword
      ? await this._searchNotes(searchKeyword)
      : await this._loadNotes();

    this._emptyContent();
    this._updateStyle();
    this._shadowRoot.appendChild(this._style);

    const noteListContainer = document.createElement("div");
    noteListContainer.classList.add("note-list");

    notes.forEach((note, index) => {
      const noteElement = document.createElement("note-item");
      noteElement.note = note;

      gsap.from(noteElement, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        delay: index * 0.1,
        ease: "power3.out",
      });

      noteListContainer.appendChild(noteElement);
    });

    this._shadowRoot.appendChild(noteListContainer);

    if (loadingIndicator) {
      loadingIndicator.hide();
    }
  }
  showErrorMessage(message) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
    });
  }
}

customElements.define("note-list", NoteList);
