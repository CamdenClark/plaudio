import { Firestore } from "@google-cloud/firestore";

const firestore = new Firestore({
  projectid: "plaudio",
});

type FirebaseUser = {
  uid: string;
  email: string;
};

exports.registerUser = async (firebaseUser: FirebaseUser) => {
  const userDocument = firestore.doc(`users/${firebaseUser.uid}`);
  const user = await userDocument.set({
    id: firebaseUser.uid,
    email: firebaseUser.email,
    admin: false,
  });
  if (user) {
    console.log(`Created user ${firebaseUser.uid}`);
  }
};

type ComputeScoreEvent = {
  data: string;
};

exports.computeScore = async (pubSubEvent: ComputeScoreEvent) => {
  const { soundId, scoreDelta } = JSON.parse(
    Buffer.from(pubSubEvent.data, "base64").toString()
  );

  console.log(`Updating sound ${soundId} with score delta ${scoreDelta}`);
  const soundDocument = firestore.doc(`sounds/${soundId}`);
  const sound = await soundDocument.get();
  const data = sound.data();
  if (!data) {
    return;
  }
  const { createdAt, score } = data;

  const newScore = score + scoreDelta;
  console.log(
    `Computed document with score ${newScore} and created at ${createdAt.seconds}`
  );

  const tS = createdAt.seconds - 1590285563;
  const y = newScore > 0 ? 1 : newScore === 0 ? 0 : -1;
  const z = Math.abs(newScore) < 1 ? 1 : Math.abs(newScore);
  const computedScore = Math.log10(z) + (y * tS) / 45000;
  console.log(`New computed score for ${soundId}: ${computedScore}`);

  await soundDocument.update({
    score: newScore,
    computedScore,
  });
  console.log(`Updated sound succesfully`);
};
