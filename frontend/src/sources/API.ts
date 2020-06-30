import axios, { AxiosInstance } from "axios";
import { Sound, UserSound } from "../models/Sound";
import { RawSound } from "../models/RawSound";

export interface IAPI {
  vote(soundId: string, vote: number): Promise<void>;
  submit(sound: Partial<Sound>): Promise<Sound>;
  loadSounds(page: number): Promise<Sound[]>;
  loadSound(soundId: string): Promise<Sound>;
  upload(file: File): Promise<RawSound>;
}

const sounds: Sound[] = [
  {
    soundId: "snd-biden",
    text: "Biden test 1",
    url: "https://storage.googleapis.com/homophone-test/snd-biden8.mp3",
    score: 2,
    userVote: 0,
    createdAt: 1590306971,
    userId: "Bruh",
  },
  {
    soundId: "snd-biden2",
    text: "Biden test 2",
    url: "https://storage.cloud.google.com/homophone-test/snd-vivaldi.mp3",
    score: 2,
    userVote: 0,
    createdAt: 1590306941,
    userId: "Bruh",
  },
];

export class MockAPI implements IAPI {
  vote(soundId: string, vote: number): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  submit(sound: UserSound): Promise<Sound> {
    return new Promise((resolve) => {
      console.log("submitted sound");
      resolve({ ...sounds[1], text: sound.text, userId: sound.text });
    });
  }

  loadSound(soundId: string): Promise<Sound> {
    return new Promise((resolve) => {
      resolve(sounds.filter((sound) => sound.soundId === soundId)[0]);
    });
  }

  loadSounds(page: number): Promise<Sound[]> {
    return new Promise((resolve) => {
      resolve(sounds);
    });
  }

  upload(file: File): Promise<RawSound> {
    return new Promise((resolve) => {
      resolve({ fileId: "test", name: "test.mp3" });
    });
  }
}

export class RealAPI implements IAPI {
  client: AxiosInstance = axios.create({
    baseURL: "http://api.homophone.io",
  });

  vote(soundId: string, vote: number): Promise<void> {
    return this.client
      .post(`/sounds/${soundId}/vote`, { vote })
      .then((response) => {
        console.log(`Response: ${response.data}`);
        return response.data;
      });
  }

  submit(sound: UserSound): Promise<Sound> {
    return this.client.post(`/sounds`, sound).then((response) => {
      console.log(`Response: ${response.data}`);
      return response.data;
    });
  }

  loadSound(soundId: string): Promise<Sound> {
    return this.client
      .get(`/sounds/${soundId}`)
      .then((response) => response.data);
  }

  loadSounds(page: number): Promise<Sound[]> {
    return this.client.get("/sounds").then((response) => response.data);
  }

  upload(file: File): Promise<RawSound> {
    const formData = new FormData();
    formData.append("file", file);
    return this.client
      .post("/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  }
}