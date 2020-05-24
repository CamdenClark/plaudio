const express = require('express');
const bodyParser = require('body-parser');

const Firestore = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub();
const TOPIC_NAME = "text-to-speech";
const topic = pubsub.topic(TOPIC_NAME);

const db = new Firestore({
    projectid: 'homophone',
});

const app = express();
app.use(bodyParser.json({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
});

app.get('/sounds', async (req, res) => {
    const query = db
        .collection('sounds')
        //.where('createdAt', '>', new Date(Date.now() - (1000 * 60 * 60 * 24)))
        .orderBy('computedScore', 'desc').limit(10);
    const sounds = await query.get();
    const { docs } = sounds;
    res.send(docs.map(doc => doc.data()).map(doc => { doc["createdAt"] = doc["createdAt"].seconds; return doc }));
});

app.get('/compute', async (req, res) => {
    const query = db.collection('sounds')
        .where('createdAt', '>', new Date(Date.now() - (1000 * 60 * 60 * 24)));
    const sounds = await query.get();
    const { docs } = sounds;
    for (let doc of docs) {
        const { createdAt, score } = doc.data();
        console.log(createdAt)
        console.log(`Computed document with score ${score} and created at ${createdAt.seconds}`);
        const tS = createdAt.seconds - 1590285563;
        const y = score > 0 ? 1 : score === 0 ? 0 : -1;
        const z = Math.abs(score) < 1 ? 1 : Math.abs(score);
        const newComputedScore = Math.log10(z) + ((y * tS) / 45000);
        console.log(`New computed score ${newComputedScore}`);
        await db.doc(doc.ref.path).update({
            computedScore: newComputedScore
        });
    }
    res.sendStatus(200);
});

app.post('/sounds', async (req, res) => {
    const { id, text, username } = req.body;
    console.log(`Creating sound with id ${id}, username ${username}, and text ${text}.`);
    const document = db.doc(`sounds/${id}`);
    await document.set({
        id: id,
        text: text,
        createdAt: new Date(Date.now()),
        username: username,
        score: 1
    });

    await db.doc(`votes/${id}_${username}`).set({ vote: 1 });

    const buffer = Buffer.from(JSON.stringify({
        text: text,
        id: id,
        username: username
    }));
    topic.publish(buffer);
    res.sendStatus(200);
});

app.post('/sounds/:soundId/vote', async (req, res) => {
    const { soundId } = req.params;
    const { vote, userId } = req.body;
    console.log(`Userid ${userId} votes ${vote} on ${soundId}`);

    const voteDocument = db.doc(`votes/${soundId}_${userId}`);
    const existingVote = await voteDocument.get();
    if (existingVote.exists) {
        await voteDocument.update({
            vote: vote
        });
    } else {
        await voteDocument.set({
            vote: vote
        });
    }
    const scoreDelta = vote - (existingVote.exists ? existingVote.get('vote') : 0);
    const soundDocument = db.doc(`sounds/${soundId}`);
    const sound = await soundDocument.get();
    await soundDocument.update({
        score: sound.get('score') + scoreDelta
    });
    res.sendStatus(200);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});