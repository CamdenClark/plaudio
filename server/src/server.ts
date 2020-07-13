import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import shortid from "shortid";
import Multer from "multer";

import { PubSub } from "@google-cloud/pubsub";
import { Storage } from "@google-cloud/storage";
import admin from "firebase-admin";

import { FirebaseStore, IStore } from "@plaudio/common";

const pubsub = new PubSub();
const storage = new Storage();
const TOPIC_NAME = "text-to-speech";
const topic = pubsub.topic(TOPIC_NAME);
const voteTopic = pubsub.topic("vote-trigger");

admin.initializeApp();

const store = new FirebaseStore();

type User = {
  id: string;
  email: string;
  admin: boolean;
  name?: string;
};

interface Request extends express.Request {
  authToken?: string;
  authId: string;
  user: User;
}

const getAuthToken = (req: Request, res: any, next: any) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  }
  next();
};

const checkIfAuthenticated = (req: Request, res: any, next: any) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;
      if (!authToken) {
        return res
          .status(401)
          .send({ error: "You are not authorized to make this request." });
      }
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

const getUser = async (req: Request) => {
  const { authId } = req;
  return await store.getUser(authId);
};

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const renderSound = (sound: any) => ({
  soundId: sound.soundId,
  url: "https://storage.googleapis.com/plaudio-main/" + sound.soundId + ".mp3",
  createdAt: sound.createdAt.seconds,
  score: sound.score,
  userId: sound.userId,
  displayName: sound.displayName,
  text: sound.text,
});

app.get("/", (req: Request, res: any) => {
  res.send("Working...");
});

app.get("/sounds", async (req: Request, res: any) => {
  const sounds = await store.getTopSounds();
  res.send(sounds.map(renderSound));
});

app.post("/sounds", checkIfAuthenticated, async (req: Request, res: any) => {
  const { text, displayName, sourceFile } = req.body;
  const soundId = "snd-" + shortid.generate();
  const user = await getUser(req);
  if (!user) {
    res.status(400).send("Can't submit if you're not authenticated.");
    return;
  }
  const name = user.admin ? displayName : user.name;
  if (!name) {
    res.status(400).send("Can't submit if you don't have a name");
  }
  console.log(
    `Creating sound with id ${soundId}, display name ${name}, and text ${text}.`
  );
  const userId = user.id;
  await store.createSound({
    soundId,
    userId,
    displayName: name,
    text,
    createdAt: new Date(Date.now()),
    score: 0,
    computedScore: 0,
    sourceFile: sourceFile || "",
  });

  await store.upsertVote(soundId, userId, 1);

  const buffer = Buffer.from(
    JSON.stringify({
      text,
      soundId,
      displayName: name,
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

app.get("/sounds/:soundId", async (req: Request, res: any) => {
  const { soundId } = req.params;
  console.log(`Fetching sound with id ${soundId}`);
  const apiSound = await store.getSound(soundId);
  const sound = renderSound(apiSound);
  res.send(sound);
});

app.post(
  "/sounds/:soundId/vote",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const { soundId } = req.params;
    const userId = req.authId;
    const { vote } = req.body;
    console.log(`Userid ${userId} votes ${vote} on ${soundId}`);

    const oldVote = await store.upsertVote(soundId, userId, vote);

    const scoreDelta = vote - oldVote;
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
  }
);

app.post(
  "/files",
  checkIfAuthenticated,
  multer.single("file"),
  async (req: Request, res: any, next: any) => {
    const { file } = req;
    const fileId = "file-" + shortid.generate();

    const bucket = storage.bucket("plaudio-main");

    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      next(err);
    });
    blobStream.on("finish", async () => {
      const audioFile = { fileId, name: file.originalname, userId: req.authId };

      await store.createFile(audioFile);
      res.send(audioFile);
    });

    blobStream.end(req.file.buffer);
  }
);

app.get("/users/me", checkIfAuthenticated, async (req: Request, res: any) => {
  const user = await getUser(req);
  res.send(user);
});

/* *** CONTENT WARNING *** */
const blockedNameMatch = "(nigg|fag)";
/* *** CONTENT WARNING *** */
const onlyCharactersAndSpaces = "^([a-z]|\\s)*$";

app.put("/users/me", checkIfAuthenticated, async (req: any, res: any) => {
  const user = await getUser(req);
  if (user && user.name) {
    res.sendStatus(400);
    return;
  }
  const { name } = req.body;
  const lowerDisplayName = name.toLocaleLowerCase();

  const usesBlockedNames = lowerDisplayName.match(blockedNameMatch);
  const usesBadCharacters = !lowerDisplayName.match(onlyCharactersAndSpaces);
  const tooShort = lowerDisplayName.length < 3;
  const tooLong = lowerDisplayName.length > 15;

  const invalidName =
    tooLong || tooShort || usesBlockedNames || usesBadCharacters ? true : false;
  if (invalidName) {
    res.status(400).send({ message: "You provided an invalid name" });
  }
  await store.updateUser(req.authId, { name });
  res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
