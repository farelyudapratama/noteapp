import Swal from "sweetalert2";

const BASE_URL = "https://notes-api.dicoding.dev/v2";

class NotesApi {
  static async createNote(note) {
    // console.log('Sending note:', note);
    return fetch(`${BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error creating note:", error);
        throw error;
      });
  }

  static async getNotes() {
    try {
      const response = await fetch(`${BASE_URL}/notes`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  }

  // static async updateNote(note) {
  //     try {
  //         const response = await fetch(`${BASE_URL}/notes`, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json'
  //             },
  //             body: JSON.stringify(note)
  //         });
  //         return await response.json();
  //     } catch (error) {
  //         console.error('Error deleting note:', error);
  //         throw error;
  //     }
  // }

  static async deleteNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }

  static async getNotesArchive() {
    try {
      const response = await fetch(`${BASE_URL}/notes/archived`, {
        method: "GET",
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching notes archive:", error);
      throw error;
    }
  }

  static async archiveNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}/archive`, {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      console.error("Error archiving note:", error);
      throw error;
    }
  }

  static async unarchiveNote(id) {
    try {
      const response = await fetch(`${BASE_URL}/notes/${id}/unarchive`, {
        method: "POST",
      });
      return await response.json();
    } catch (error) {
      console.error("Error archiving note:", error);
      throw error;
    }
  }
}

export default NotesApi;
