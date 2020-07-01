var ffmpeg = require("fluent-ffmpeg");
const express = require("express");
const fs = require("fs");
const util = require("util");
const bodyParser = require("body-parser");
const { Storage } = require("@google-cloud/storage");
const textToSpeech = require("@google-cloud/text-to-speech");

const storage = new Storage();
const client = new textToSpeech.TextToSpeechClient();

const app = express();
app.use(bodyParser.json());

const replaceSoundEmojis = (text) =>
  text.replace(
    "metalGearAlert",
    `<audio src="https://www.myinstants.com/media/sounds/tindeck_1.mp3">
        metalGearAlert
        </audio>`
  );

const getSSML = ({ displayName, text }) =>
  `<speak>User ${displayName} says, ${replaceSoundEmojis(text)}</speak>`;

app.post("/", async (req, res) => {
  const { soundId, text, displayName, sourceFile } = JSON.parse(
    Buffer.from(req.body.message.data, "base64").toString()
  );
  const request = {
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
  const bucket = storage.bucket("homophone-test");
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
          .on("progress", (progress) => {
            console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
          })
          .on("error", (err) => {
            console.log(`[ffmpeg] error: ${err.message}`);
            reject();
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
          .on("progress", (progress) => {
            console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
          })
          .on("error", (err) => {
            console.log(`[ffmpeg] error: ${err.message}`);
            reject();
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
      reject();
    }
  });
  await bucket.upload(`${soundId}.mp3`);
  res.status(204).send();
});
app.listen(8080, "0.0.0.0");
