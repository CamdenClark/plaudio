export interface Sound {
  soundId: string;
  text: string;
  score: number;
  createdAt: number;
  url: string;
  userId: string;
  displayName: string;
}

export interface APISound {
  soundId: string;
  text: string;
  score: number;
  createdAt: Date;
  userId: string;
  displayName: string;
  computedScore: number;
  sourceFile: string;
}
