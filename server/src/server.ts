import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import shortid from "shortid";
import Multer from "multer";

import { SoundStatus, User } from "@plaudio/common";

import { FirebaseAuth } from "./auth";
import { Publish } from "./publish";
import { FirebaseStore } from "./store";
import { Filestorage } from "./storage";
import { DBSoundToSound } from "./models";

const filestorage = new Filestorage();
const publish = new Publish();
const auth = new FirebaseAuth();
const store = new FirebaseStore();

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
      const userInfo = await auth.verifyIdToken(authToken);
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

app.get("/", (req: Request, res: any) => {
  res.send("Working...");
});

app.get("/sounds", async (req: Request, res: any) => {
  const sounds = await store.getTopSounds();
  res.send(sounds.map(DBSoundToSound));
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

  if (!text || text.length < 1) {
    console.log(`You need text to submit a sound.`);
    res.status(400).send("You need to submit text along with a sound.");
  }

  if (text.length > 500) {
    console.log(`Text content too long, must be below 500 characters.`);
    res
      .status(400)
      .send("Text content too long, must be below 500 characters.");
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
    duration: 0,
    score: 0,
    computedScore: 0,
    sourceFile: sourceFile || "",
    status: SoundStatus.Processing,
  });

  await store.upsertVote(soundId, userId, 1);

  await publish.publishSound({
    text,
    soundId,
    displayName: name,
    sourceFile: sourceFile || "",
  });

  await publish.publishVote({
    soundId,
    scoreDelta: 1,
  });

  res.sendStatus(200);
});

app.get("/sounds/:soundId", async (req: Request, res: any) => {
  const { soundId } = req.params;
  console.log(`Fetching sound with id ${soundId}`);
  const apiSound = await store.getSound(soundId);
  const sound = DBSoundToSound(apiSound);
  res.send(sound);
});

app.get(
  "/sounds/:soundId/vote",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const { soundId } = req.params;
    const userId = req.authId;
    const vote = await store.getVote(soundId, userId);

    res.status(200).send(vote);
  }
);

app.post(
  "/sounds/:soundId/vote",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const { soundId } = req.params;
    const userId = req.authId;
    const { vote } = req.body;

    const votes = new Set([-1, 0, 1]);

    if (!votes.has(vote)) {
      console.log(`${vote} on ${soundId} by ${userId} is not a valid vote.`);
      res.sendStatus(400);
    }
    console.log(`Userid ${userId} votes ${vote} on ${soundId}`);

    const oldVote = await store.upsertVote(soundId, userId, vote);

    const scoreDelta = vote - oldVote;
    if (scoreDelta !== 0) {
      await publish.publishVote({ soundId, scoreDelta });
    }
    res.sendStatus(200);
  }
);

app.post(
  "/sounds/:soundId/report",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const { soundId } = req.params;
    const userId = req.authId;
    console.log(`REPORT: Userid ${userId} reported ${soundId}`);

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

    const onFinish = async () => {
      const audioFile = { fileId, name: file.originalname, userId: req.authId };
      await store.createFile(audioFile);
      res.send(audioFile);
    };

    filestorage.uploadAudioFile(file, onFinish, next);
  }
);

app.get("/users/me", checkIfAuthenticated, async (req: Request, res: any) => {
  const user = await getUser(req);
  res.send(user);
});

app.get(
  "/users/me/sounds",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const sounds = await store.getMySounds(req.authId);
    res.send(sounds.map(DBSoundToSound));
  }
);

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
