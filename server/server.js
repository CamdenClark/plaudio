const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const shortid = require("shortid");
const Multer = require("multer");
const admin = require("firebase-admin");

const Firestore = require("@google-cloud/firestore");
const { PubSub } = require("@google-cloud/pubsub");
const { Storage } = require("@google-cloud/storage");

const pubsub = new PubSub();
const storage = new Storage();
const TOPIC_NAME = "text-to-speech";
const topic = pubsub.topic(TOPIC_NAME);
const voteTopic = pubsub.topic("vote-trigger");

admin.initializeApp();

const db = new Firestore({
  projectid: "homophone",
});

const getAuthToken = (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  } else {
    req.authToken = null;
  }
  next();
};

const checkIfAuthenticated = (req, res, next) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;
      const userInfo = await admin.auth().verifyIdToken(authToken);
      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      return res
        .status(401)
        .send({ error: "You are not authorized to make this request" });
    }
  });
};

const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(cors({ origin: true }));
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: 100 * 1024 * 1024,
});

const renderSound = (sound) => ({
  soundId: sound.soundId,
  url:
    "https://storage.googleapis.com/homophone-test/" + sound.soundId + ".mp3",
  createdAt: sound.createdAt.seconds,
  score: sound.score,
  userId: sound.userId,
  text: sound.text,
});

app.get("/", (req, res) => {
  res.send("Working...");
});

app.get("/sounds", async (req, res) => {
  const query = db
    .collection("sounds")
    .orderBy("computedScore", "desc")
    .limit(10);
  const sounds = await query.get();
  const { docs } = sounds;
  res.send(docs.map((doc) => doc.data()).map(renderSound));
});

app.post("/sounds", checkIfAuthenticated, async (req, res) => {
  const { text, userId, sourceFile } = req.body;
  const soundId = "snd-" + shortid.generate();
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

app.get("/sounds/:soundId", async (req, res) => {
  const { soundId } = req.params;
  console.log(`Fetching sound with id ${soundId}`);
  const document = await db.doc(`sounds/${soundId}`).get();
  const sound = renderSound(document.data());
  res.send(sound);
});

app.post("/sounds/:soundId/vote", async (req, res) => {
  const { soundId } = req.params;
  const { vote, userId } = req.body;
  console.log(`Userid ${userId} votes ${vote} on ${soundId}`);

  const voteDocument = db.doc(`sounds/${soundId}/votes/${userId}`);
  const existingVote = await voteDocument.get();
  if (existingVote.exists) {
    await voteDocument.update({
      vote,
    });
  } else {
    await voteDocument.set({
      vote,
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

app.post("/files", multer.single("file"), async (req, res, next) => {
  const { file } = req;
  const fileId = "file-" + shortid.generate();

  const bucket = storage.bucket("homophone-test");

  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });
  blobStream.on("finish", async () => {
    const audioFile = { fileId, name: file.originalname };

    const document = db.doc(`files/${fileId}`);
    await document.set(audioFile);
    res.send(audioFile);
  });

  blobStream.end(req.file.buffer);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
