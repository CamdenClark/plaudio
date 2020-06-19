import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:homophone/components/sound.dart';
import 'package:homophone/models/sound.dart';
import 'package:homophone/services/audio.dart';

class HomeBody extends StatefulWidget {
  @override
  _HomeBodyState createState() => _HomeBodyState();
}

class _HomeBodyState extends State<HomeBody> {
  @override
  void initState() {
    Provider.of<SoundModel>(context, listen: false).getHomeSounds();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var sounds = Provider.of<SoundModel>(context).homeSounds();
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
