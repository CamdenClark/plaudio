import { PubSub } from "@google-cloud/pubsub";

export interface IPublish {
  publishFavorite(favoriteInfo: any): Promise<string>;
  publishSound(soundInfo: any): Promise<string>;
}

export class Publish implements IPublish {
  pubsub = new PubSub();

  publishFavorite(favoriteInfo: any): Promise<string> {
    const publishBuffer = Buffer.from(JSON.stringify(favoriteInfo));
    return this.pubsub.topic("vote-trigger").publish(publishBuffer);
  }

  publishSound(soundInfo: any): Promise<string> {
    const publishBuffer = Buffer.from(JSON.stringify(soundInfo));
    return this.pubsub.topic("text-to-speech").publish(publishBuffer);
  }
}
