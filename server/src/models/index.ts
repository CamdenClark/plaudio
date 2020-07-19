import { Sound, SoundStatus } from "@plaudio/common";

interface FirebaseDate {
  seconds: number;
}

export interface DBSound {
  soundId: string;
  text: string;
  score: number;
  duration: number;
  createdAt: FirebaseDate | Date;
  userId: string;
  displayName: string;
  computedScore: number;
  sourceFile: string;
  status: SoundStatus;
}

export const DBSoundToSound = (sound: DBSound): Sound => ({
  soundId: sound.soundId,
  url: "https://storage.googleapis.com/plaudio-main/" + sound.soundId + ".mp3",
  createdAt:
    sound.createdAt instanceof Date
      ? sound.createdAt.getUTCSeconds()
      : sound.createdAt.seconds,
  duration: sound.duration,
  score: sound.score,
  userId: sound.userId,
  displayName: sound.displayName,
  text: sound.text,
  status: sound.status,
});
