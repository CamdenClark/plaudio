const Firestore = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectid: "homophone",
});

exports.registerUser = async (firebaseUser) => {
  const userDocument = firestore.doc(`users/${firebaseUser.uid}`);
  const user = await userDocument.set({
    id: firebaseUser.uid,
    email: firebaseUser.email,
    admin: false,
  });
  console.log(`Created user ${user.id}`);
};

exports.computeScore = async (pubSubEvent) => {
  const { soundId, scoreDelta } = JSON.parse(
    Buffer.from(pubSubEvent.data, "base64").toString()
  );

  console.log(`Updating sound ${soundId} with score delta ${scoreDelta}`);
  const soundDocument = firestore.doc(`sounds/${soundId}`);
  const sound = await soundDocument.get();
  const { createdAt, score } = sound.data();

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

  res.sendStatus(200);
};
