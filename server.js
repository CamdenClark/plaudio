const express = require('express');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
});

app.get('/posts', async (req, res) => {
    const client = new textToSpeech.TextToSpeechClient();
    const storage = new Storage();
    const request = {
        input: { text: 'Google cloud is synthesizing some text.' },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        const blob = storage.bucket("homophone-test").file('google-cloud-test.mp3');
        const blobStream = blob.createWriteStream();

        blobStream.on('error', (err) => {
            next(err);
            console.log(err);
        });

        blobStream.on('finish', () => {
            const publicUrl = 'https://storage.googleapis.com/homophone-test/' + blob.name;
            res.status(200).send(publicUrl);
        });

        blobStream.end(response.audioContent);
    }
    catch (error) {
        console.log(error.message);
    }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});