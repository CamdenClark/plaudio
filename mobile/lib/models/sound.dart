import 'package:flutter/widgets.dart';
import 'package:homophone/sound_repository.dart';

enum Vote { Up, None, Down }

int voteToInt(Vote vote) {
  return vote == Vote.Up ? 1 : vote == Vote.Down ? -1 : 0;
}

class Sound {
  Sound({this.text, this.username, this.url, this.score, this.id, this.vote});

  String text;
  String username;
  String url;
  String id;
  int score;
  Vote vote;
}

class SoundModel extends ChangeNotifier {
  SoundRepository soundRepository = SoundRepository();
  List<String> _profileSounds;
  List<String> _homeSounds;

  Map<String, Sound> _soundMap;

  Sound getSound(id) => _soundMap[id];

  List<Sound> profileSounds() =>
      _profileSounds.map((id) => _soundMap[id]).toList();
  List<Sound> homeSounds() => _homeSounds.map((id) => _soundMap[id]).toList();

  Future<void> getHomeSounds() async {
    var homeSounds = await soundRepository.fetchHomeSounds();
    _homeSounds = homeSounds.map((sound) => sound.id).toList();
    _soundMap = homeSounds.fold(_soundMap, (acc, next) {
      acc[next.id] = next;
      return acc;
    });
    notifyListeners();
  }

  Future<void> getProfileSounds() async {
    var profileSounds = await soundRepository.fetchProfileSounds();
    _profileSounds = profileSounds.map((sound) => sound.id).toList();
    _soundMap = profileSounds.fold(_soundMap, (acc, next) {
      acc[next.id] = next;
      return acc;
    });
    notifyListeners();
  }

  Future<void> submitSound(String text) async {
    var sound = await soundRepository.submitSound(text);
    _soundMap[sound.id] = sound;
    _profileSounds.add(sound.id);
    notifyListeners();
  }

  Future<void> voteSound(String soundId, Vote vote) async {
    await soundRepository.voteSound(soundId, vote);
    var sound = _soundMap[soundId];
    sound.vote = vote;
    notifyListeners();
  }

  SoundModel({
    List<String> homeSounds,
    List<String> profileSounds,
    Map<String, Sound> soundMap,
  })  : _profileSounds = profileSounds ?? [],
        _homeSounds = homeSounds ?? [],
        _soundMap = soundMap ?? {};
}
