var ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const app = express();

app.post('/', async (req, res) => {
    const storage = new Storage();
    console.log(req.body);
    /*const { id, text, username } = JSON.parse(
        Buffer.from(req.body.message.data, 'base64').toString()
    );*/
    const id = 'snd-testin';
    await new Promise((resolve, reject) => {
        try {
            ffmpeg()
                .input('metalGearAlert.mp3')
                .audioFilters('aecho=0.8:0.9:1000:0.3')
                .on('progress', (progress) => {
                    console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
                })
                .on('error', () => {
                    console.log(`[ffmpeg] error: ${err.message}`);
                    reject();
                })
                .on('end', () => {
                    console.log(`[ffmpeg] finished`);
                    resolve();
                })
                .output(`${id}.mp3`)
                .run();
        }
        catch (error) {
            console.error(error.message);
            reject();
        }
    });
    const bucket = storage.bucket('homophone-test');
    await bucket.upload(`${id}.mp3`);
    res.send('Hello from docker!');
});
app.listen(8080, '0.0.0.0');