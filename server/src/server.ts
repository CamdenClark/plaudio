import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import shortid from "shortid";
import Multer from "multer";

import { Timestamp } from "@google-cloud/firestore";
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

const validTextCharacters = `^([a-zA-Z]|\\s|\\d|\\?|\\.|\\,|\\!|\\'|\\")*$`;

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
    return;
  }

  if (!text || text.length < 1) {
    console.log(`You need text to submit a sound.`);
    res.status(400).send("You need to submit text along with a sound.");
    return;
  }

  if (text.length > 500) {
    console.log(`Text content too long, must be below 500 characters.`);
    res
      .status(400)
      .send("Text content too long, must be below 500 characters.");
    return;
  }

  if (!text.match(validTextCharacters)) {
    console.log(`Text content ${text} doesn't meet validation requirements.`);
    res.status(400).send("Text content contains invalid characters.");
    return;
  }

  const mySounds = await store.getMySounds(user.id);
  if (
    mySounds.filter(
      (sound) => sound.createdAt.toDate() > new Date(Date.now() - 86400000)
    ).length >= 5
  ) {
    console.log(`You've already posted 5 times today`);
    res
      .status(400)
      .send("You've already made 5 submissions in the last 24 hours.");
    return;
  }
  console.log(
    `Creating sound with id ${soundId}, display name ${name}, and text ${text}.`
  );
  const userId = user.id;
  const dbSound = {
    soundId,
    userId,
    displayName: name,
    text,
    createdAt: Timestamp.fromDate(new Date(Date.now())),
    duration: 0,
    favorites: 0,
    sourceFile: sourceFile || "",
    status: SoundStatus.Processing,
  };
  const sound = await store.createSound(dbSound);

  await publish.publishSound({
    text,
    soundId,
    displayName: name,
    sourceFile: sourceFile || "",
  });

  await publish.publishFavorite({
    soundId,
    userId,
    score: 1,
  });

  res.status(200).send(sound);
});

app.get("/sounds/:soundId", async (req: Request, res: any) => {
  const { soundId } = req.params;
  console.log(`Fetching sound with id ${soundId}`);
  const apiSound = await store.getSound(soundId);
  const sound = DBSoundToSound(apiSound);
  res.send(sound);
});

app.get(
  "/sounds/:soundId/favorite",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const { soundId } = req.params;
    const userId = req.authId;
    const favorite = await store.getFavorite(soundId, userId);

    res.status(200).send(favorite);
  }
);

app.post(
  "/sounds/:soundId/favorite",
  checkIfAuthenticated,
  async (req: Request, res: any) => {
    const { soundId } = req.params;
    const userId = req.authId;
    const { score } = req.body;

    const scores = new Set([0, 1]);

    if (!scores.has(score)) {
      console.log(`${score} on ${soundId} by ${userId} is not a valid vote.`);
      res.sendStatus(400);
    }
    console.log(`Userid ${userId} votes ${score} on ${soundId}`);

    await publish.publishFavorite({ soundId, score, userId });
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

app.get("/users/:displayName/sounds", async (req: any, res: any) => {
  const { displayName } = req.params;
  const sounds = await store.getProfileSounds(displayName.replace("_", " "));
  res.send(sounds.filter((snd) => snd.status === SoundStatus.Active));
});

/* *** CONTENT WARNING *** */
const blockedNameMatch = "(nigg|fag)";
/* *** CONTENT WARNING *** */
const onlyCharactersAndSpaces = "^([a-z]|\\s)*$";

app.post("/users", async (req: any, res: any) => {
  const { name, email, password } = req.body;
  const lowerDisplayName = name.toLocaleLowerCase();

  const usesBlockedNames = lowerDisplayName.match(blockedNameMatch);
  const usesBadCharacters = !lowerDisplayName.match(onlyCharactersAndSpaces);
  const tooShort = lowerDisplayName.length < 3;
  const tooLong = lowerDisplayName.length > 15;

  const invalidName =
    tooLong || tooShort || usesBlockedNames || usesBadCharacters ? true : false;
  if (invalidName) {
    console.log(`Name ${name} was invalid.`);
    res.status(400).send({ message: "You provided an invalid name" });
    return;
  }
  const existingUserWithName = await store.getUserByDisplayName(
    lowerDisplayName
  );
  if (existingUserWithName) {
    res.status(400).send({ message: "A user with that name already exists." });
    return;
  }

  const lowercaseName = name.toLocaleLowerCase();
  auth
    .signup(email, password)
    .then((firebaseUser) => {
      const user = {
        admin: false,
        email,
        name,
        lowercaseName,
        id: firebaseUser.uid,
      };
      store.createUser(user).then((_) => {
        res.status(200).send(user);
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(400).send();
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
