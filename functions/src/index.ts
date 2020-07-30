import { Firestore, FieldValue } from "@google-cloud/firestore";
import { SoundStatus } from "@plaudio/common";

const firestore = new Firestore({
  projectid: "plaudio",
});

type ComputeScoreEvent = {
  data: string;
};

exports.computeScore = async (pubSubEvent: ComputeScoreEvent) => {
  const { soundId, score, userId } = JSON.parse(
    Buffer.from(pubSubEvent.data, "base64").toString()
  );

  console.log(
    `Updating sound ${soundId} with score ${score} by user ${userId}`
  );
  const soundDocument = firestore.doc(`sounds/${soundId}`);
  const sound = await soundDocument.get();
  if (!sound.exists) {
    return;
  }
  const favorites = sound.get("favorites");

  const oldFavoriteDocument = firestore.doc(
    `sounds/${soundId}/favorites/${userId}`
  );
  const oldFavorite = await oldFavoriteDocument.get();
  let newFavorites = favorites;
  if (!oldFavorite.exists) {
    newFavorites = favorites + score;
  } else {
    newFavorites = favorites + score - oldFavorite.get("score");
  }
  await oldFavoriteDocument.set({ score });

  await soundDocument.update({
    favorites: newFavorites,
  });
};

exports.renderSuccess = async (pubSubEvent: ComputeScoreEvent) => {
  const { soundId, userId, duration } = JSON.parse(
    Buffer.from(pubSubEvent.data, "base64").toString()
  );

  console.log(`Marking ${soundId} by user ${userId} as succeeded.`);

  const createdAt = new Date(Date.now());

  await firestore.doc(`feeds/${userId}`).update({
    lastPosted: createdAt,
    recentPosts: FieldValue.arrayUnion({ soundId, createdAt }),
  });

  await firestore
    .doc(`sounds/${soundId}`)
    .update({ status: SoundStatus.Active, duration });
};

exports.renderFailure = async (pubSubEvent: ComputeScoreEvent) => {
  const { soundId, userId } = JSON.parse(
    Buffer.from(pubSubEvent.data, "base64").toString()
  );

  console.log(`Marking ${soundId} by user ${userId} as failed.`);

  await firestore
    .doc(`sounds/${soundId}`)
    .update({ status: SoundStatus.Error });
};
