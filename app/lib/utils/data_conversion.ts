import { Note, ImageNote } from "@/app/types";
import { VideoType, AudioType, PhotoType } from "../models/media_class";

/**
 * Utility class for converting media types in fetched data to the appropriate classes.
 */
export default class DataConversion {
  /**
   * Converts media types in the fetched data to the appropriate classes.
   * @param {any[]} data - The fetched data containing media items.
   * @returns {Note[]} The converted notes, sorted with appropriate media classes.
   */
  static convertMediaTypes(data: any[]): Note[] {
    const fetchedNotes: Note[] = data.map((message: any) => {
      let time = new Date(message.__rerum.createdAt);
      if (message.time === undefined) {
        time = new Date(message.__rerum.createdAt);
        var date = new Date();
        var offsetInHours = date.getTimezoneOffset() / 60;
        time.setHours(time.getHours() - offsetInHours);
      } else {
        time = new Date (message.time);
      }

      const mediaItems = message.media.map((item: any) => {
        if (item.type === "video") {
          return new VideoType({
            uuid: item.uuid,
            type: item.type,
            uri: item.uri,
            thumbnail: item.thumbnail,
            duration: item.duration,
          });
        } else if (item.type === "audio") {
          return new AudioType({
            uuid: item.uuid,
            type: item.type,
            uri: item.uri,
            duration: item.duration,
            name: item.name,
            isPlaying: false,
          });
        } else {
          return new PhotoType({
            uuid: item.uuid,
            type: item.type,
            uri: item.uri,
          });
        }
      });

      const audioItems = message.audio?.map((item: any) => {
        return new AudioType({
          uuid: item.uuid,
          type: item.type,
          uri: item.uri,
          duration: item.duration,
          name: item.name,
          isPlaying: false,
        });
      });

      return {
        id: message["@id"],
        title: message.title || "",
        text: message.BodyText || "",
        time: time || "",
        creator: message.creator || "",
        media: mediaItems || [],
        audio: audioItems || [],
        latitude: message.latitude || "",
        longitude: message.longitude || "",
        published: message.published || false,
        tags: message.tags || [],
      };
    });

    fetchedNotes.sort(
      (b, a) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return fetchedNotes;
  }
  /**
   * Extracts images from the fetched notes and returns an array of ImageNote objects.
   * @param {Note[]} fetchedNotes - The fetched notes containing media items.
   * @returns {ImageNote[]} The extracted images with corresponding note information.
   */
  static extractImages(fetchedNotes: Note[]): ImageNote[] {
    /**
     * Represents an image with its corresponding note information.
     * @typedef {Object} ImageNote
     * @property {any} image - The image data.
     * @property {Note} note - The note information.
     */

    /**
     * Represents a note with its properties.
     * @typedef {Object} Note
     * @property {string} id - The ID of the note.
     * @property {string} title - The title of the note.
     * @property {string} text - The text content of the note.
     * @property {string} time - The timestamp of the note.
     * @property {(VideoType | PhotoType)[]} media - The media items associated with the note.
     * @property {AudioType[]} audio - The audio items associated with the note.
     * @property {string} creator - The creator of the note.
     * @property {string} latitude - The latitude coordinate of the note.
     * @property {string} longitude - The longitude coordinate of the note.
     * @property {boolean} published - The published status of the note.
     */

    /**
     * Represents a video media item.
     * @typedef {Object} VideoType
     * @property {string} uuid - The UUID of the video.
     * @property {string} type - The type of the media item (e.g., "video").
     * @property {string} uri - The URI of the video.
     * @property {string} thumbnail - The thumbnail URI of the video.
     * @property {number} duration - The duration of the video in seconds.
     */

    /**
     * Represents an audio media item.
     * @typedef {Object} AudioType
     * @property {string} uuid - The UUID of the audio.
     * @property {string} type - The type of the media item (e.g., "audio").
     * @property {string} uri - The URI of the audio.
     * @property {number} duration - The duration of the audio in seconds.
     * @property {string} name - The name of the audio.
     */

    /**
     * Represents a photo media item.
     * @typedef {Object} PhotoType
     * @property {string} uuid - The UUID of the photo.
     * @property {string} type - The type of the media item (e.g., "photo").
     * @property {string} uri - The URI of the photo.
     */
    const extractedImages: ImageNote[] = fetchedNotes.flatMap((note) => {
      return note.media.map((item: any) => {
        if (item.type === "video") {
          return {
            image: item.thumbnail,
            note: {
              id: note.id,
              title: note.title || "",
              text: note.text || "",
              media: note.media.map((mediaItem: any) => {
                if (mediaItem.type === "video") {
                  return new VideoType({
                    uuid: mediaItem.uuid,
                    type: mediaItem.type,
                    uri: mediaItem.uri,
                    thumbnail: mediaItem.thumbnail,
                    duration: mediaItem.duration,
                  });
                } else {
                  return new PhotoType({
                    uuid: mediaItem.uuid,
                    type: mediaItem.type,
                    uri: mediaItem.uri,
                  });
                }
              }),
              audio: note.audio || [],
              time: note.time || "",
              creator: note.creator || "",
              latitude: note.latitude,
              longitude: note.longitude,
              published: note?.published || false,
              tags: note?.tags || [],
            },
          };
        } else {
          return {
            image: item.uri,
            note: {
              id: note.id,
              title: note.title || "",
              text: note.text || "",
              media: note.media.map((mediaItem: any) => {
                if (mediaItem.type === "video") {
                  return new VideoType({
                    uuid: mediaItem.uuid,
                    type: mediaItem.type,
                    uri: mediaItem.uri,
                    thumbnail: mediaItem.thumbnail,
                    duration: mediaItem.duration,
                  });
                } else {
                  return new PhotoType({
                    uuid: mediaItem.uuid,
                    type: mediaItem.type,
                    uri: mediaItem.uri,
                  });
                }
              }),
              audio: note.audio || [],
              time: note.time || "",
              creator: note.creator || "",
              latitude: note.latitude,
              longitude: note.longitude,
              published: note?.published || false,
              tags: note?.tags || [],
            },
          };
        }
      });
    });

    return extractedImages;
  }
}
