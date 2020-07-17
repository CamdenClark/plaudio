import { PubSub } from "@google-cloud/pubsub";

export interface IPublish {
  publishVote(voteInfo: any): Promise<string>;
  publishSound(soundInfo: any): Promise<string>;
}

export class Publish implements IPublish {
  pubsub = new PubSub();

  publishVote(voteInfo: any): Promise<string> {
    const publishBuffer = Buffer.from(JSON.stringify(voteInfo));
    return this.pubsub.topic("vote-trigger").publish(publishBuffer);
  }

  publishSound(soundInfo: any): Promise<string> {
    const publishBuffer = Buffer.from(JSON.stringify(soundInfo));
    return this.pubsub.topic("text-to-speech").publish(publishBuffer);
  }
}
