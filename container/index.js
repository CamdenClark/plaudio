var ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const fs = require('fs');
const util = require('util')
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');
const textToSpeech = require('@google-cloud/text-to-speech');

const app = express();
app.use(bodyParser.json());

app.post('/', async (req, res) => {
    const storage = new Storage();
    const client = new textToSpeech.TextToSpeechClient();
    const { id, text, username } = JSON.parse(
        Buffer.from(req.body.message.data, 'base64').toString()
    );
    const request = {
        input: {
            ssml: `<speak>User ${username} says, ${text}
        <audio src="https://www.myinstants.com/media/sounds/tindeck_1.mp3">
            metalGearAlert
        </audio> 
        </speak>` },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };
    const writeFile = util.promisify(fs.writeFile);

    const [response] = await client.synthesizeSpeech(request);
    console.log(`Synthesized speech for ${id}`)
    await writeFile(`${id}-tts.mp3`, response.audioContent, 'binary');
    console.log(`Saved synthesized speech for ${id}`)
    const bucket = storage.bucket('homophone-test');
    await bucket.file('flac_sample.flac').download({ destination: `flac_sample.flac` });
    console.log(`Got file read stream`)

    await new Promise((resolve, reject) => {
        try {
            ffmpeg()
                .input(`${id}-tts.mp3`)
                .input(`flac_sample.flac`)
                .audioBitrate(256)
                .on('progress', (progress) => {
                    console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
                })
                .on('error', (err) => {
                    console.log(`[ffmpeg] error: ${err.message}`);
                    reject();
                })
                .on('end', () => {
                    console.log(`[ffmpeg] finished`);
                    resolve();
                })
                .output(`${id}.mp3`)
                .complexFilter({
                    filter: 'concat',
                    options: {
                        n: 2,
                        v: 0,
                        a: 1,
                    }
                })
                .run();
        }
        catch (error) {
            console.error(error.message);
            reject();
        }
    });
    await bucket.upload(`${id}.mp3`);
    res.status(204).send();
});
app.listen(8080, '0.0.0.0');