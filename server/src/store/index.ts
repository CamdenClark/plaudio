import { AudioFile, User, SoundStatus } from "@plaudio/common";
import { Firestore } from "@google-cloud/firestore";

import { DBSound } from "../models";

export interface IStore {
  getFavorite(soundId: string, userId: string): Promise<number>;
  createUser(user: User): Promise<void>;
  getUser(userId: string): Promise<User>;
  getUserByDisplayName(displayName: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  createFile(file: AudioFile): Promise<AudioFile>;
  createSound(sound: DBSound): Promise<DBSound>;
  getSound(soundId: string): Promise<DBSound>;
  getTopSounds(): Promise<DBSound[]>;
  getMySounds(userId: string): Promise<DBSound[]>;
}

export class FirebaseStore implements IStore {
  store: Firestore;
  constructor() {
    this.store = new Firestore({ projectid: "plaudio" });
  }

  async getFavorite(soundId: string, userId: string): Promise<any> {
    const voteDocument = await this.store.doc(
      `sounds/${soundId}/favorites/${userId}`
    );
    const vote = await voteDocument.get();
    if (vote.exists) {
      return vote.data();
    }
    return { vote: 0 };
  }

  async createUser(user: User): Promise<void> {
    await this.store.doc(`users/${user.id}`).set(user);
  }

  async getUser(userId: string): Promise<User> {
    const userDocument = await this.store.doc(`users/${userId}`).get();
    const user = userDocument.data();
    if (user) {
      return user as User;
    } else {
      throw new Error(`User ${userId} doesn't exist.`);
    }
  }

  async getUserByDisplayName(
    lowercaseDisplayName: string
  ): Promise<User | null> {
    const query = await this.store
      .collection(`users`)
      .where("lowercaseName", "==", lowercaseDisplayName);
    const results = await query.get();
    if (results.docs.length < 1) {
      return null;
    }
    return results.docs[0].data() as User;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await this.store.doc(`users/${userId}`).update(updates);
  }

  async createFile(audioFile: AudioFile): Promise<AudioFile> {
    const file = await this.store
      .doc(`files/${audioFile.fileId}`)
      .set(audioFile);
    if (!file) {
      throw new Error(`Can't create file object ${audioFile}`);
    }
    return audioFile;
  }

  async createSound(sound: DBSound): Promise<DBSound> {
    const newSound = await this.store.doc(`sounds/${sound.soundId}`).set(sound);
    if (!newSound) {
      throw new Error(`Can't create sound object ${sound}`);
    }
    return sound;
  }

  async getSound(soundId: string): Promise<DBSound> {
    const soundDocument = await this.store.doc(`sounds/${soundId}`).get();
    const sound = soundDocument.data();
    if (sound) {
      return sound as DBSound;
    } else {
      throw new Error(`Sound ${soundId} doesn't exist.`);
    }
  }

  async getTopSounds(): Promise<DBSound[]> {
    const query = this.store
      .collection("sounds")
      .where("status", "==", SoundStatus.Active)
      .orderBy("computedScore", "desc")
      .limit(10);
    const sounds = await query.get();
    return sounds.docs.map((doc) => doc.data()) as DBSound[];
  }

  async getMySounds(userId: string): Promise<DBSound[]> {
    const query = this.store
      .collection("sounds")
      .where(`userId`, "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10);
    const sounds = await query.get();
    return sounds.docs.map((doc) => doc.data()) as DBSound[];
  }
}
