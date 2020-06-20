const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { PubSub } = require("@google-cloud/pubsub");
const Firestore = require("@google-cloud/firestore");

const pubsub = new PubSub();
const TOPIC_NAME = "text-to-speech";
const topic = pubsub.topic(TOPIC_NAME);
const voteTopic = pubsub.topic("vote-trigger");

const db = new Firestore({
  projectid: "homophone",
});

const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(cors({ origin: true }));

app.get("/", (req, res) => {
  res.send("Hello from App Engine!");
});

app.get("/sounds", async (req, res) => {
  const query = db
    .collection("sounds")
    .orderBy("computedScore", "desc")
    .limit(10);
  const sounds = await query.get();
  const { docs } = sounds;
  res.send(
    docs
      .map((doc) => doc.data())
      .map((doc) => {
        doc["createdAt"] = doc["createdAt"].seconds;
        doc["url"] =
          "https://storage.googleapis.com/homophone-test/" +
          doc["soundId"] +
          ".mp3";
        return doc;
      })
  );
});

app.post("/sounds", async (req, res) => {
  const { soundId, text, userId, sourceFile } = req.body;
  console.log(
    `Creating sound with id ${soundId}, user id ${userId}, and text ${text}.`
  );
  const document = db.doc(`sounds/${soundId}`);
  await document.set({
    soundId,
    userId,
    text,
    createdAt: new Date(Date.now()),
    score: 0,
    computedScore: 0,
    sourceFile: sourceFile || "",
  });

  await db.doc(`sounds/${soundId}/votes/${userId}`).set({ vote: 1 });

  const buffer = Buffer.from(
    JSON.stringify({
      text,
      soundId,
      userId,
      sourceFile: sourceFile || "",
    })
  );
  topic.publish(buffer);

  const voteBuffer = Buffer.from(
    JSON.stringify({
      soundId,
      scoreDelta: 1,
    })
  );
  voteTopic.publish(voteBuffer);

  res.sendStatus(200);
});

app.post("/sounds/:soundId/vote", async (req, res) => {
  const { soundId } = req.params;
  const { vote, userId } = req.body;
  console.log(`Userid ${userId} votes ${vote} on ${soundId}`);

  const voteDocument = db.doc(`sounds/${soundId}/votes/${userId}`);
  const existingVote = await voteDocument.get();
  if (existingVote.exists) {
    await voteDocument.update({
      vote: vote,
    });
  } else {
    await voteDocument.set({
      vote: vote,
    });
  }
  const scoreDelta =
    vote - (existingVote.exists ? existingVote.get("vote") : 0);
  if (scoreDelta !== 0) {
    const buffer = Buffer.from(
      JSON.stringify({
        soundId,
        scoreDelta,
      })
    );
    voteTopic.publish(buffer);
  }
  res.sendStatus(200);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
