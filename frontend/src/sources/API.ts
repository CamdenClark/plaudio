import axios, { AxiosInstance } from "axios";
import { Sound, UserSound } from "../models/Sound";

export interface IAPI {
  vote(vote: number): Promise<void>;
  submit(sound: Partial<Sound>): Promise<Sound>;
  loadSounds(page: number): Promise<Sound[]>;
  loadSound(soundId: string): Promise<Sound>;
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
  vote(vote: number): Promise<void> {
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
}

export class RealAPI implements IAPI {
  client: AxiosInstance = axios.create({
    baseURL: "https://api-dot-homophone.wl.r.appspot.com",
  });

  vote(vote: number): Promise<void> {
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
    return this.client.get("/sounds").then((response) => response.data);
    /*return new Promise((resolve) => {

      resolve(sounds);
    });
    */
  }
}
