export interface Sound {
  soundId: string;
  text: string;
  score: number;
  createdAt: number;
  url: string;
  userId: string;
  displayName: string;
}

export interface UserSound {
  text: string;
  displayName: string;
  sourceFile?: string;
}
