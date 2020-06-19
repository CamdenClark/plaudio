import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'package:homophone/components/sound.dart';
import 'package:homophone/models/sound.dart';
import 'package:homophone/services/audio.dart';

class ProfileIcon extends StatelessWidget {
  const ProfileIcon({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTap: () {
          Navigator.pushNamed(context, '/profile');
        },
        child: Container(
            padding: EdgeInsets.only(right: 20, left: 20),
            child: Icon(Icons.person_outline)));
  }
}

class ProfileBody extends StatelessWidget {
  const ProfileBody({
    Key key,
    this.sounds,
  }) : super(key: key);

  final List<Sound> sounds;

  @override
  Widget build(BuildContext context) {
    return ListView(
        children: sounds
            .map((sound) => ListSound(
                sound: sound,
                startPlaying: () async {
                  await AudioService.start(
                    backgroundTaskEntrypoint: audioPlayerTaskEntrypoint,
                    androidNotificationChannelName: 'Audio Service Demo',
                    notificationColor: 0xFF2196f3,
                    androidNotificationIcon: 'mipmap/ic_launcher',
                    androidStopOnRemoveTask: true,
                    enableQueue: true,
                  );
                  await AudioService.replaceQueue(
                      sounds.map(soundToMediaItem).toList());
                  await AudioService.skipToQueueItem(sound.id);
                }))
            .toList());
  }
}
