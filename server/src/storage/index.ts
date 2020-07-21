import { Storage } from "@google-cloud/storage";

export interface IStorage {
  uploadAudioFile(file: any, onFinish: any, onError: any): any;
}

export class Filestorage implements IStorage {
  storage = new Storage();

  uploadAudioFile(file: any, onFinish: any, onError: any): any {
    const bucket = this.storage.bucket("plaudio-raw");

    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      onError(err);
    });
    blobStream.on("finish", async () => {
      await onFinish();
    });

    blobStream.end(file.buffer);
  }
}
