import { AudioFile, User, SoundStatus } from "@plaudio/common";
import { Firestore, FieldValue } from "@google-cloud/firestore";

import { DBSound } from "../models";

export interface IStore {
  getFavorite(soundId: string, userId: string): Promise<number>;
  createUser(user: User): Promise<void>;
  getUser(userId: string): Promise<User>;
  getUserByDisplayName(displayName: string): Promise<User | null>;
  createFile(file: AudioFile): Promise<AudioFile>;
  createSound(sound: DBSound): Promise<DBSound>;
  getSound(soundId: string): Promise<DBSound>;
  getTopSounds(): Promise<DBSound[]>;
  getMySounds(userId: string): Promise<DBSound[]>;
  getFeedSounds(userId: string): Promise<DBSound[]>;
  follow(followed: string, follower: string): Promise<void>;
  unfollow(followed: string, follower: string): Promise<void>;
}

export class FirebaseStore implements IStore {
  store: Firestore;
  constructor() {
    this.store = new Firestore({ projectid: "plaudio" });
  }

  async getFavorite(soundId: string, userId: string): Promise<any> {
    const favoriteDocument = await this.store.doc(
      `sounds/${soundId}/favorites/${userId}`
    );
    const favorite = await favoriteDocument.get();
    if (favorite.exists) {
      return favorite.data();
    }
    return { score: 0 };
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
      .orderBy("favorites", "desc")
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

  async getProfileSounds(displayName: string): Promise<DBSound[]> {
    const query = this.store
      .collection("sounds")
      .where(`displayName`, "==", displayName)
      .orderBy("createdAt", "desc")
      .limit(10);
    const sounds = await query.get();
    return sounds.docs.map((doc) => doc.data()) as DBSound[];
  }

  async getFeedSounds(userId: string): Promise<DBSound[]> {
    const query = this.store
      .collection("feeds")
      .where(`followers`, "array-contains", userId)
      .orderBy("lastPosted", "desc")
      .limit(10);
    const feed = await query.get();
    const feedSounds = feed.docs
      .map((doc) => doc.data())
      .reduce((acc, cur) => acc.concat(cur.recentSounds), [])
      .sort(
        (a: Partial<DBSound>, b: Partial<DBSound>) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )
      .map((sound: DBSound) => sound.soundId);

    const soundQuery = this.store
      .collection("sounds")
      .where(`soundId`, "in", feedSounds);
    const sounds = await soundQuery.get();
    return sounds.docs.map((doc) => doc.data()) as DBSound[];
  }

  async follow(followed: string, follower: string): Promise<void> {
    await this.store
      .doc(`feeds/${followed}`)
      .update({ followers: FieldValue.arrayUnion(follower) });
  }

  async unfollow(followed: string, follower: string): Promise<void> {
    await this.store
      .doc(`feeds/${followed}`)
      .update({ followers: FieldValue.arrayRemove(follower) });
  }
}
