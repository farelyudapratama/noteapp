import NotesApi from "../data/remote/notesApi.js";
import Swal from "sweetalert2";

class NoteItem extends HTMLElement {
  _shadowRoot = null;
  _style = null;
  _note = {
    id: null,
    title: null,
    body: null,
    createdAt: null,
    archived: null,
  };

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
  }

  set note(value) {
    this._note = value;
    this.render();
  }

  get note() {
    return this._note;
  }

  _updateStyle() {
    this._style.textContent = `
            :host {
                display: block;
                border-radius: 8px;
                box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
                overflow: hidden;
                padding: 16px;
                background-color: #f9f9f9;
                margin: 16px 16px;
            }
            .note-title {
                font-size: 1.2em;
                color: #333;
                margin: 0 0 8px 0;
            }
            .note-body {
                font-size: 1em;
                color: #666;
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .note-date {
                font-size: 0.8em;
                color: #999;
                margin-top: 8px;
            }
            .note-actions {
                margin-top: 16px;
                display: flex;
                gap: 8px;
            }
            .note-actions button {
                padding: 5px 10px;
                background-color: cornflowerblue;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            /*.note-actions button:hover {
                background-color: #4485ff;
            }*/
            .note-actions button.delete-button {
                background-color: #e65f21;
            }
            .note-actions button.delete-button:hover {
                background-color: #d44b0b;
            }
        `;
  }

  connectedCallback() {
    this.render();
    // this._shadowRoot.querySelector('.edit-button').addEventListener('click', () => {
    //   this._openEditForm();
    // });
    this._shadowRoot
      .querySelector(".delete-button")
      .addEventListener("click", () => {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await this._deleteNote();

            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        });
      });

    this._shadowRoot
      .querySelector("#archiveButton")
      .addEventListener("click", async () => {
        if (this._note.archived) {
          await NotesApi.unarchiveNote(this._note.id);
        } else {
          await NotesApi.archiveNote(this._note.id);
        }
        document.dispatchEvent(new Event("notesChanged"));
      });
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  render() {
    this._emptyContent();
    this._updateStyle();
    const createdAtDate = new Date(this._note.createdAt);
    const formattedDate = `${createdAtDate.getDate()} ${createdAtDate.toLocaleString("default", { month: "long" })} ${createdAtDate.getFullYear()} ${createdAtDate.getHours()}:${createdAtDate.getMinutes().toString().padStart(2, "0")}`;
    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.innerHTML += `
            <div class="note">
                <div class="note-title">${this._note.title}</div>
                <div class="note-body">${this._note.body}</div>
                <div class="note-date">${formattedDate}</div>
                <div class="note-actions">
                    <!-- <button class="edit-button">Edit</button> -->  
                    <button class="delete-button">Delete</button>
                    <button id="archiveButton">${this._note.archived ? "Unarchive" : "Archive"}</button>
                </div>
            </div>
        `;
  }

  // async _openEditForm() {
  //   const noteForm = document.querySelector('note-form');
  //   noteForm.open(this._note, this._note.id);
  // }

  async _deleteNote() {
    try {
      await NotesApi.deleteNote(this._note.id);
      document.dispatchEvent(new CustomEvent("notesChanged"));
    } catch (error) {
      console.error("Error deleting note:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        error,
        text: "Failed to delete note",
      });
      // alert('Failed to delete note');
    }
  }
}

customElements.define("note-item", NoteItem);
