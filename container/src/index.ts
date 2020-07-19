import ffmpeg from "fluent-ffmpeg";
import express from "express";
import fs from "fs";
import util from "util";
import bodyParser from "body-parser";
import { Storage } from "@google-cloud/storage";
import textToSpeech from "@google-cloud/text-to-speech";
import { Firestore } from "@google-cloud/firestore";
import { SoundStatus } from "@plaudio/common";

const storage = new Storage();
const firestore = new Firestore();
const client = new textToSpeech.TextToSpeechClient();

const app = express();
app.use(bodyParser.json());

const replaceSoundEmojis = (text: string) =>
  text.replace(
    "metalGearAlert",
    `<audio src="https://www.myinstants.com/media/sounds/tindeck_1.mp3">
        metalGearAlert
        </audio>`
  );

type TTSRequestInput = {
  ssml: string;
};

type TTSRequestVoice = {
  languageCode: string;
  ssmlGender: "NEUTRAL";
};

type TTSRequestAudioConfig = {
  audioEncoding: "MP3";
};

type TTSRequest = {
  input: TTSRequestInput;
  voice: TTSRequestVoice;
  audioConfig: TTSRequestAudioConfig;
};

const getSSML = ({ displayName, text }: any) =>
  `<speak>User ${displayName} says, ${replaceSoundEmojis(text)}</speak>`;

app.post("/", async (req: any, res: any) => {
  const { soundId, text, displayName, sourceFile } = JSON.parse(
    Buffer.from(req.body.message.data, "base64").toString()
  );
  const request: TTSRequest = {
    input: {
      ssml: getSSML({ text, displayName }),
    },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };
  const writeFile = util.promisify(fs.writeFile);

  const [response] = await client.synthesizeSpeech(request);
  console.log(`Synthesized speech for ${soundId}`);
  await writeFile(`${soundId}-tts.mp3`, response.audioContent, "binary");
  console.log(`Saved synthesized speech for ${soundId}`);
  const bucket = storage.bucket("plaudio-main");
  if (sourceFile.length > 0) {
    await bucket.file(sourceFile).download({ destination: sourceFile });
    console.log(`Saved source file`);
  }

  await new Promise((resolve, reject) => {
    try {
      if (sourceFile.length > 0) {
        ffmpeg()
          .input(`${soundId}-tts.mp3`)
          .input(sourceFile)
          .audioBitrate(256)
          .on("progress", (progress: any) => {
            console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
          })
          .on("error", (err: any) => {
            console.log(`[ffmpeg] error: ${err.message}`);
            firestore
              .doc(`sounds/${soundId}`)
              .update({ status: SoundStatus.Error })
              .then((_) => {
                reject();
              });
          })
          .on("end", () => {
            console.log(`[ffmpeg] finished`);
            resolve();
          })
          .output(`${soundId}.mp3`)
          .complexFilter({
            filter: "concat",
            options: {
              n: 2,
              v: 0,
              a: 1,
            },
          })
          .run();
      } else {
        ffmpeg()
          .input(`${soundId}-tts.mp3`)
          .audioBitrate(256)
          .on("progress", (progress: any) => {
            console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
          })
          .on("error", (err: any) => {
            console.log(`[ffmpeg] error: ${err.message}`);
            firestore
              .doc(`sounds/${soundId}`)
              .update({ status: SoundStatus.Error })
              .then((_) => {
                reject();
              });
          })
          .on("end", () => {
            console.log(`[ffmpeg] finished`);
            resolve();
          })
          .output(`${soundId}.mp3`)
          .run();
      }
    } catch (error) {
      console.error(error.message);
      res.status(400).send();
      reject();
    }
  });
  const duration = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(`${soundId}.mp3`, (error, metadata) => {
      console.log(`format: ${metadata.format}`);
      resolve(metadata.format.duration);
    });
  });

  await firestore
    .doc(`sounds/${soundId}`)
    .update({ status: SoundStatus.Active, duration });
  await bucket.upload(`${soundId}.mp3`);
  res.status(204).send();
});
app.listen(8080, "0.0.0.0");
