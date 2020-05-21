const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();

const TOPIC_NAME = "text-to-speech";
const pubsub = new PubSub();
const topic = pubsub.topic(TOPIC_NAME);

app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
});

app.get('/posts', async (req, res) => {
    const buffer = Buffer.from(JSON.stringify({ text: "I love spicy chicken teriyaki." }));
    topic.publish(buffer);
    res.sendStatus(200);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});