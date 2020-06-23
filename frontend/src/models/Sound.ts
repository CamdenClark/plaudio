export interface Sound {
  soundId: string;
  text: string;
  score: number;
  createdAt: number;
  url: string;
  userId: string;
  userVote: number;
}

export interface UserSound {
  text: string;
  userId: string;
  sourceFile?: string;
}
