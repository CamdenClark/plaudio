import 'dart:math';

import 'package:homophone/models/sound.dart';

class SoundRepository {
  Random random = Random.secure();

  Future<List<Sound>> fetchHomeSounds() async {
    await Future.delayed(Duration(milliseconds: 200));
    return Iterable<Sound>.generate(
        10,
        (int id) => Sound(
            id: "snd-" + random.nextInt(10000).toString(),
            text: "Test" + id.toString(),
            username: "Dog Food Emblem",
            url:
                "https://s3.amazonaws.com/scifri-episodes/scifri20181123-episode.mp3",
            score: 10)).toList();
  }

  Future<List<Sound>> fetchProfileSounds() async {
    await Future.delayed(Duration(milliseconds: 200));
    return Iterable<Sound>.generate(
        10,
        (int id) => Sound(
            id: "snd-" + random.nextInt(10000).toString(),
            text: "Profile " + id.toString(),
            username: "Me",
            url:
                "https://s3.amazonaws.com/scifri-episodes/scifri20181123-episode.mp3",
            score: 10)).toList();
  }

  Future<void> voteSound(String soundId, Vote vote) async {
    await Future.delayed(Duration(milliseconds: 200));
    return;
  }

  Future<Sound> submitSound(String text) async {
    await Future.delayed(Duration(milliseconds: 200));
    return Sound(
        id: "snd-" + Random.secure().nextInt(10000).toString(),
        text: text,
        url:
            "https://s3.amazonaws.com/scifri-episodes/scifri20181123-episode.mp3",
        username: "me",
        score: 0,
        vote: Vote.Up);
  }
}
