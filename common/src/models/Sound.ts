export enum SoundStatus {
  Processing,
  Active,
  Error,
}

export interface UserSound {
  soundId: string;
  userId: string;
  createdAt: number;
}

export interface Sound {
  soundId: string;
  text: string;
  score: number;
  createdAt: number;
  url: string;
  userId: string;
  displayName: string;
  status: SoundStatus;
}
