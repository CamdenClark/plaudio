import { Firestore } from "@google-cloud/firestore";

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
    `sound/${soundId}/favorites/${userId}`
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
