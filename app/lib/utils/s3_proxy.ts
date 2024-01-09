const S3_PROXY_PREFIX = process.env.NEXT_PUBLIC_S3_PROXY_PREFIX;

async function convertHeicToJpg(uri: string) {
  console.log("Converting HEIC to JPG...");
  const convertedImageUri = await performHeicToJpgConversion(uri);
  console.log("Converted image URI: ", convertedImageUri);
  return convertedImageUri;
}

async function performHeicToJpgConversion(uri: string) {
  return uri;
}

async function uploadMedia(file: File, mediaType: string): Promise<string> {
    console.log("uploadMedia - Input file:", file);
  
    let data = new FormData();
    const uniqueName = `media-${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`;
  
    // Directly append the file object to FormData
    data.append("file", file, uniqueName);
  
    return fetch(S3_PROXY_PREFIX + "uploadFile", {
      method: "POST",
      mode: "cors",
      body: data,
    })
      .then((resp) => {
        console.log("uploadMedia - Server response status:", resp.status);
        if (resp.ok) {
          const location = resp.headers.get("Location");
          console.log("uploadMedia - Uploaded successfully, Location:", location);
          return location;
        } else {
          console.log("uploadMedia - Server response body:", resp.body);
        }
      })
      .catch((err) => {
        console.error("uploadMedia - Error:", err);
        return err;
      });
  }
  

// async function uploadMedia(uri: string, mediaType: string) {
//   console.log("uploadMedia - Input URI:", uri);

//   let data = new FormData();
//   const uniqueName = `media-${Date.now()}.${
//     mediaType === "image" ? "jpg" : "mp4"
//   }`;

//   const response = await fetch(uri);
//   const blob = await response.blob();
//   const file = new File([blob], uniqueName, {
//     type: mediaType === "image" ? "image/jpeg" : "video/mp4",
//   });

//   data.append("file", file);

//   return fetch("http://s3-proxy.rerum.io/S3/uploadFile", {
//     method: "POST",
//     mode: "cors",
//     body: data,
//   })
//     .then((resp) => {
//       console.log("uploadMedia - Server response status:", resp.status);
//       if (resp.ok) {
//         const location = resp.headers.get("Location");
//         console.log("uploadMedia - Uploaded successfully, Location:", location);
//         return location;
//       } else {
//         console.log("uploadMedia - Server response body:", resp.body);
//       }
//     })
//     .catch((err) => {
//       console.error("uploadMedia - Error:", err);
//       return err;
//     });
// }

export async function uploadAudio(uri: string) {
  let data = new FormData();
  const uniqueName = `media-${Date.now()}.mp3`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const file = new File([blob], uniqueName, {
    type: `audio/mp3`,
  });

  data.append("file", file);

  return fetch("http://s3-proxy.rerum.io/S3/uploadFile", {
    method: "POST",
    mode: "cors",
    body: data,
  })
    .then((resp) => {
      console.log("uploadMedia - Server response status:", resp.status);
      if (resp.ok) {
        const location = resp.headers.get("Location");
        console.log("uploadMedia - Uploaded successfully, Location:", location);
        return location;
      } else {
        console.log("uploadMedia - Server response body:", resp.body);
      }
    })
    .catch((err) => {
      console.error("uploadMedia - Error:", err);
      return err;
    });
}

export { convertHeicToJpg, uploadMedia };
