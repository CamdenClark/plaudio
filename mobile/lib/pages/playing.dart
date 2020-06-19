import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:provider/provider.dart';

import 'package:homophone/components/sound.dart';
import 'package:homophone/models/sound.dart';

class PlaySound extends StatelessWidget {
  const PlaySound({
    Key key,
    this.sound,
  }) : super(key: key);

  final Sound sound;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
          border: Border(
              bottom: BorderSide(
                  width: 1.0, color: Color.fromRGBO(100, 100, 100, 0.7)))),
      margin: EdgeInsets.all(20),
      child: AbstractSound(sound: sound),
    );
  }
}

class PlayingBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
        stream: AudioService.currentMediaItemStream,
        builder: (_, AsyncSnapshot<MediaItem> snapshot) {
          var nowPlaying =
              Provider.of<SoundModel>(context).getSound(snapshot.data?.id);
          return (nowPlaying != null)
              ? Container(
                  margin: EdgeInsets.only(bottom: 50),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Expanded(
                            flex: 3,
                            child: Row(children: [
                              Expanded(
                                  child: PlaySound(
                                      sound: Sound(
                                          text: nowPlaying.text,
                                          username: nowPlaying.username)))
                            ])),
                        PlayerControls(),
                        ScoreRow(nowPlaying: nowPlaying),
                      ],
                    ),
                  ))
              : Container();
        });
  }
}

class ScoreRow extends StatelessWidget {
  const ScoreRow({
    Key key,
    @required this.nowPlaying,
  }) : super(key: key);

  final Sound nowPlaying;

  @override
  Widget build(BuildContext context) {
    return Expanded(
        flex: 1,
        child: Container(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              GestureDetector(
                  onTap: () {
                    if (nowPlaying.vote != Vote.Down) {
                      AudioService.skipToNext();
                    }
                    Provider.of<SoundModel>(context, listen: false).voteSound(
                        nowPlaying.id,
                        nowPlaying.vote == Vote.Down ? Vote.None : Vote.Down);
                  },
                  child: Container(
                      child: Icon(Icons.thumb_down,
                          size: 48,
                          color: nowPlaying.vote == Vote.Down
                              ? Colors.pink
                              : Colors.black))),
              Text((nowPlaying.score + voteToInt(nowPlaying.vote)).toString(),
                  textScaleFactor: 2),
              GestureDetector(
                  onTap: () {
                    Provider.of<SoundModel>(context, listen: false).voteSound(
                        nowPlaying.id,
                        nowPlaying.vote == Vote.Up ? Vote.None : Vote.Up);
                  },
                  child: Container(
                      child: Icon(Icons.thumb_up,
                          size: 48,
                          color: nowPlaying.vote == Vote.Up
                              ? Colors.lightGreen
                              : Colors.black))),
            ],
          ),
        ));
  }
}

class PlayerControls extends StatelessWidget {
  const PlayerControls({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Expanded(
        flex: 1,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            Expanded(
                child: GestureDetector(
                    onTap: () {
                      AudioService.skipToPrevious();
                    },
                    child: Container(
                        padding: EdgeInsets.all(20),
                        child: Icon(Icons.skip_previous, size: 48)))),
            Expanded(
                child: GestureDetector(
                    onTap: () {
                      var basicState = AudioService.playbackState.basicState;
                      if (basicState == BasicPlaybackState.playing) {
                        AudioService.pause();
                      } else if (basicState != BasicPlaybackState.buffering ||
                          basicState != BasicPlaybackState.skippingToPrevious ||
                          basicState != BasicPlaybackState.skippingToNext) {
                        AudioService.play();
                      }
                    },
                    child: Container(
                        padding: EdgeInsets.all(20),
                        child: StreamBuilder(
                            stream: AudioService.playbackStateStream,
                            builder: (context, snapshot) {
                              var basicState = snapshot.data?.basicState;
                              if (basicState == BasicPlaybackState.playing) {
                                return Icon(Icons.pause, size: 48);
                              } else if (basicState ==
                                      BasicPlaybackState.buffering ||
                                  basicState ==
                                      BasicPlaybackState.skippingToNext ||
                                  basicState ==
                                      BasicPlaybackState.skippingToPrevious) {
                                return Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: SizedBox(
                                    width: 24.0,
                                    height: 48.0,
                                    child: CircularProgressIndicator(),
                                  ),
                                );
                              } else {
                                return Icon(Icons.play_arrow, size: 48);
                              }
                            })))),
            Expanded(
                child: GestureDetector(
                    onTap: () {
                      AudioService.skipToNext();
                    },
                    child: Container(
                        padding: EdgeInsets.all(20),
                        child: Icon(Icons.skip_next, size: 48)))),
          ],
        ));
  }
}
