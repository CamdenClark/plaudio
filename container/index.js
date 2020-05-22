var ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const fs = require('fs');

console.log("Success!");

const app = express();

app.get('/', async (req, res) => {
    await new Promise((resolve, reject) =>
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
            .output('metalGearAlert10.mp3')
            .run());
    res.send('Hello from docker!');
});
app.listen(8080, '0.0.0.0');