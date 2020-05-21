const textToSpeech = require('@google-cloud/text-to-speech');
const { Storage } = require('@google-cloud/storage');
const ffmpeg = require('fluent-ffmpeg');

exports.speak = async pubSubEvent => {
    const client = new textToSpeech.TextToSpeechClient();
    const storage = new Storage();
    const { id, text, username } = JSON.parse(
        Buffer.from(pubSubEvent.data, 'base64').toString()
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

    try {
        const [response] = await client.synthesizeSpeech(request);
        const bucket = storage.bucket("homophone-test");

        const soundItem = bucket.file('Vivaldi_Sonata_eminor_.mp3').createReadStream();

        const blob = bucket.file(`${id}.mp3`);
        const blobStream = blob.createWriteStream();

        ffmpeg().input(response.audioContent).input(soundItem)
            .audioCodec('libmp3lame').output(blobStream).run();

        blobStream.on('error', (err) => {
            next(err);
            console.log(err);
        });
    }
    catch (error) {
        console.log(error.message);
    }
};