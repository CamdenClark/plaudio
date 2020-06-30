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

  user?: firebase.User;

  constructor(user?: firebase.User) {
    if (user) {
      this.user = user;
    }
  }

  async getIdToken() {
    if (this.user) {
      return await this.user.getIdToken();
    }
    return "";
  }

  async getConfig(headers?: object) {
    const token = await this.getIdToken();
    if (token) {
      return {
        headers: {
          ...headers,
          Authentication: "Bearer " + token,
        },
      };
    }
    return {};
  }

  async vote(soundId: string, vote: number): Promise<void> {
    const config = await this.getConfig();
    const response = await this.client.post(
      `/sounds/${soundId}/vote`,
      { vote },
      config
    );
    return response.data;
  }

  async submit(sound: UserSound): Promise<Sound> {
    const config = await this.getConfig();
    const response = await this.client.post(`/sounds`, sound, config);
    return response.data;
  }

  async loadSound(soundId: string): Promise<Sound> {
    const config = await this.getConfig();
    const response = await this.client.get(`/sounds/${soundId}`, config);
    return response.data;
  }

  async loadSounds(page: number): Promise<Sound[]> {
    const config = await this.getConfig();
    const response = await this.client.get(`/sounds`, config);
    return response.data;
  }

  async upload(file: File): Promise<RawSound> {
    const formData = new FormData();
    formData.append("file", file);
    const config = await this.getConfig({
      "Content-Type": "multipart/form-data",
    });
    const response = await this.client.post(`/files`, formData, config);
    return response.data;
  }
}
