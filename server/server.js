const express = require('express');
const bodyParser = require('body-parser');
const { PubSub } = require('@google-cloud/pubsub');
const { SecretMangerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
app.use(bodyParser.json({ extended: true }));

const TOPIC_NAME = "text-to-speech";
const pubsub = new PubSub();
const secretClient = new SecretMangerServiceClient();
const topic = pubsub.topic(TOPIC_NAME);

app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
});

app.post('/posts', async (req, res) => {
    const { id, text, username } = req.body;
    console.log(`Creating sound with id ${id}, username ${username}, and text ${text}.`);
    /* const [version] = await secretClient.accessSecretVersion({ name: 'projects/472612432652/secrets/homophone_sql_password/versions/1' });

    const payload = version.payload.data.toString();
    console.info(`Payload: ${payload}`); */

    const buffer = Buffer.from(JSON.stringify({
        text: text,
        id: id,
        username: username
    }));
    topic.publish(buffer);
    res.sendStatus(200);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});