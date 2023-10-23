/**
 * Provides methods for interacting with the API to fetch, create, update, and delete notes.
 */
export default class ApiService {
  /**
   * Fetches messages from the API.
   * @param {boolean} global - Indicates whether to fetch global messages or user-specific messages.
   * @param {string} userId - The ID of the user for user-specific messages.
   * @returns {Promise<any[]>} The array of messages fetched from the API.
   */
  static async fetchMessages(global: boolean, published: boolean, userId: string): Promise<any[]> {
    try {
      const url = "http://lived-religion-dev.rerum.io/deer-lr/query";
      const headers = {
        "Content-Type": "application/json",
      };

      let body: { type: string, published?: boolean, creator?: string } = { type: "message" };
  
      if (global) {
        body = { type: "message" };
      } else if (published) {
        body = { type: "message", published: true };
      } else {
        body = { type: "message", creator: userId };
      }
  
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }
  
  /**
   * Deletes a note from the API.
   * @param {string} id - The ID of the note to delete.
   * @param {string} userId - The ID of the user who owns the note.
   * @returns {Promise<boolean>} A boolean indicating whether the deletion was successful.
   */
  static async deleteNoteFromAPI(id: string, userId: string): Promise<boolean> {
    try {
      const url = "http://lived-religion-dev.rerum.io/deer-lr/delete";
      const headers = {
        "Content-Type": "text/plain; charset=utf-8",
      };
      const body = {
        type: "message",
        creator: userId,
        "@id": id,
      };

      const response = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify(body),
      });

      if (response.status === 204) {
        return true;
      } else {
        throw response;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  }

  /**
   * Writes a new note to the API.
   * @param {any} note - The note object to be created.
   * @returns {Promise<Response>} The response from the API.
   */
  static async writeNewNote(note: any) {
    return fetch("http://lived-religion-dev.rerum.io/deer-lr/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "message",
        title: note.title,
        media: note.media,
        BodyText: note.text,
        creator: note.creator,
        latitude: note.latitude || "",
        longitude: note.longitude || "",
        audio: note.audio,
        published: note.published,
        tags: note.tags,
        time: note.time || new Date (),
      }),
    });
  }

  /**
   * Overwrites an existing note in the API.
   * @param {any} note - The note object to be updated.
   * @returns {Promise<Response>} The response from the API.
   */
  static async overwriteNote(note: any) {
    return await fetch("http://lived-religion-dev.rerum.io/deer-lr/overwrite", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "@id": note.id,
        title: note.title,
        BodyText: note.text,
        type: "message",
        creator: note.creator,
        media: note.media,
        latitude: note.latitude,
        longitude: note.longitude,
        audio: note.audio,
        published: note.published,
        tags: note.tags,
        time: note.time,
      }),
    });
  }

  static async searchMessages(query: string): Promise<any[]> {
    try {
      const url = "http://lived-religion-dev.rerum.io/deer-lr/query";
      const headers = {
        "Content-Type": "application/json",
      };
  
      // Request body for retrieving messages of type "message"
      const body = {
        type: "message",
      };
  
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
  
      let data = await response.json();
  
      // Convert the query to lowercase for case-insensitive matching
      const lowerCaseQuery = query.toLowerCase();
  
      // Filter the messages by title or tags containing the query string
      data = data.filter((message: any) => {
        // Check if title contains the query string
        if (message.title && message.title.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
  
        // Check if any tags contain the query string
        if (message.tags && message.tags.some((tag: string) => tag.toLowerCase().includes(lowerCaseQuery))) {
          return true;
        }
  
        return false;
      });
  
      return data;
    } catch (error) {
      console.error("Error searching messages:", error);
      throw error;
    }
  }
  
  
}