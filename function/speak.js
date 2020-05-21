const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');

exports.speak = async pubSubEvent => {
    const client = new textToSpeech.TextToSpeechClient();
    const storage = new Storage();
    const { text } = JSON.parse(
        Buffer.from(pubSubEvent.data, 'base64').toString()
    );

    const request = {
        input: { text: text },
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

        blobStream.end(response.audioContent);
    }
    catch (error) {
        console.log(error.message);
    }
};