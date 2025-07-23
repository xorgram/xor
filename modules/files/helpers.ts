import { isMessageType, Message } from "$mtkruto";

// Accepts Api.Message or a compatible type
export function extractFileInfo(
  message: Message
): { fileId: string; filename?: string } | null {
  if (isMessageType(message, "photo") && message.photo) {
    return {
      fileId: message.photo.fileId,
      filename: "photo_" + message.photo.fileId.toString() + ".png",
    };
  }
  if (isMessageType(message, "document") && message.document) {
    if (message.document.fileName) {
      return {
        fileId: message.document.fileId,
        filename: message.document.fileName,
      };
    } else if (message.document.mimeType) {
      const mime = message.document.mimeType;
      if (mime.includes("video")) {
        return {
          fileId: message.document.fileId,
          filename:
            "video_" + message.document.fileId + "." + mime.split("/")[1],
        };
      }
      if (mime.includes("audio")) {
        return {
          fileId: message.document.fileId,
          filename:
            "audio_" + message.document.fileId + "." + mime.split("/")[1],
        };
      }
      return { fileId: message.document.fileId };
    }
    return { fileId: message.document.fileId };
  }
  if (isMessageType(message, "audio") && message.audio) {
    return {
      fileId: message.audio.fileId,
      filename: "audio_" + message.audio.fileId,
    };
  }
  if (isMessageType(message, "video") && message.video) {
    return {
      fileId: message.video.fileId,
      filename: "video_" + message.video.fileId,
    };
  }
  return null;
}
