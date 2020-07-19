import axios, { AxiosInstance } from "axios";
import { AudioFile } from "../models/AudioFile";
import { UserSound } from "../models/Sound";
import { Sound, SoundStatus } from "@plaudio/common";
import { User } from "../models/User";
import { Vote } from "../models/Vote";

export interface IAPI {
  getVote(soundId: string): Promise<Vote>;
  vote(soundId: string, vote: number): Promise<void>;
  submit(sound: Partial<Sound>): Promise<Sound>;
  loadMySounds(): Promise<Sound[]>;
  loadSounds(page: number): Promise<Sound[]>;
  loadSound(soundId: string): Promise<Sound>;
  upload(file: File): Promise<AudioFile>;
  me(): Promise<User>;
  updateProfile(profile: Partial<User>): Promise<void>;
}

const sounds: Sound[] = [
  {
    soundId: "snd-biden",
    text: "Biden test 1",
    url: "https://storage.googleapis.com/plaudio-main/snd-biden8.mp3",
    score: 2,
    createdAt: 1590306971,
    userId: "userid",
    displayName: "Bruh",
    status: SoundStatus.Processing,
  },
  {
    soundId: "snd-biden2",
    text: "Biden test 2",
    url: "https://storage.cloud.google.com/plaudio-main/snd-vivaldi.mp3",
    score: 2,
    createdAt: 1590306941,
    userId: "userid",
    displayName: "Bruh",
    status: SoundStatus.Processing,
  },
];

export class MockAPI implements IAPI {
  getVote(soundId: string): Promise<Vote> {
    return new Promise((resolve) => {
      resolve({ vote: 0 });
    });
  }

  vote(soundId: string, vote: number): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }

  submit(sound: UserSound): Promise<Sound> {
    return new Promise((resolve) => {
      console.log("submitted sound");
      resolve({
        ...sounds[1],
        text: sound.text,
        displayName: sound.displayName,
      });
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

  loadMySounds(): Promise<Sound[]> {
    return new Promise((resolve) => {
      resolve(sounds);
    });
  }

  upload(file: File): Promise<AudioFile> {
    return new Promise((resolve) => {
      resolve({ fileId: "test", name: "test.mp3" });
    });
  }

  me(): Promise<User> {
    return new Promise((resolve) => {
      resolve({
        id: "userid",
        email: "test@test.com",
        admin: false,
        name: "test",
      });
    });
  }

  updateProfile(profile: Partial<User>): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    });
  }
}

export class RealAPI implements IAPI {
  client: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    //baseURL: "https://api-dot-plaudio.uc.r.appspot.com",
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
          Authorization: "Bearer " + token,
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

  async getVote(soundId: string): Promise<Vote> {
    const config = await this.getConfig();
    const response = await this.client.get(`/sounds/${soundId}/vote`, config);
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

  async loadMySounds(): Promise<Sound[]> {
    const config = await this.getConfig();
    const response = await this.client.get(`/users/me/sounds`, config);
    return response.data;
  }

  async upload(file: File): Promise<AudioFile> {
    const formData = new FormData();
    formData.append("file", file);
    const config = await this.getConfig({
      "Content-Type": "multipart/form-data",
    });
    const response = await this.client.post(`/files`, formData, config);
    return response.data;
  }

  async me(): Promise<User> {
    const config = await this.getConfig();
    const response = await this.client.get(`/users/me`, config);
    return response.data;
  }

  async updateProfile(profile: Partial<User>): Promise<void> {
    const config = await this.getConfig();
    const response = await this.client.put(`/users/me`, profile, config);
    return response.data;
  }
}
