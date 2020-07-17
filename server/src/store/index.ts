import { AudioFile, APISound, User } from "@plaudio/common";
import { Firestore } from "@google-cloud/firestore";

export interface IStore {
  upsertVote(soundId: string, userId: string, vote: number): Promise<number>;
  createUser(user: User): Promise<void>;
  getUser(userId: string): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  createFile(file: AudioFile): Promise<AudioFile>;
  createSound(sound: APISound): Promise<APISound>;
  getSound(soundId: string): Promise<APISound>;
  getTopSounds(): Promise<APISound[]>;
}

export class FirebaseStore implements IStore {
  store: Firestore;
  constructor() {
    this.store = new Firestore({ projectid: "plaudio" });
  }

  async upsertVote(
    soundId: string,
    userId: string,
    vote: number
  ): Promise<number> {
    const voteDocument = await this.store.doc(
      `sounds/${soundId}/votes/${userId}`
    );
    const existingVote = await voteDocument.get();
    if (existingVote.exists) {
      await voteDocument.update({ vote });
      return existingVote.get("vote");
    } else {
      await voteDocument.set({ vote });
      return 0;
    }
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

  async createSound(sound: APISound): Promise<APISound> {
    const newSound = await this.store.doc(`sounds/${sound.soundId}`).set(sound);
    if (!newSound) {
      throw new Error(`Can't create sound object ${sound}`);
    }
    return sound;
  }

  async getSound(soundId: string): Promise<APISound> {
    const soundDocument = await this.store.doc(`sounds/${soundId}`).get();
    const sound = soundDocument.data();
    if (sound) {
      return sound as APISound;
    } else {
      throw new Error(`Sound ${soundId} doesn't exist.`);
    }
  }

  async getTopSounds(): Promise<APISound[]> {
    const query = this.store
      .collection("sounds")
      .orderBy("computedScore", "desc")
      .limit(10);
    const sounds = await query.get();
    return sounds.docs.map((doc) => doc.data()) as APISound[];
  }
}
