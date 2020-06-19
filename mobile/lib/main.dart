import 'package:audio_service/audio_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:provider/provider.dart';

import 'package:homophone/models/sound.dart';
import 'package:homophone/pages/compose.dart';
import 'package:homophone/pages/home.dart';
import 'package:homophone/pages/profile.dart';
import 'package:homophone/pages/playing.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AudioServiceWidget(
        child: ChangeNotifierProvider(
            create: (_) => SoundModel(),
            child: MaterialApp(
                title: 'Fix',
                theme: ThemeData(
                  primaryColor: Colors.black,
                ),
                initialRoute: '/',
                routes: {
                  '/': (context) => HomePage(),
                  '/playing': (context) => PlayingPage(),
                  '/compose': (context) => ComposePage(),
                  '/profile': (context) => ProfilePage()
                })));
  }
}

class NowPlayingBar extends StatelessWidget {
  const NowPlayingBar({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
        stream: AudioService.currentMediaItemStream,
        builder: (_, AsyncSnapshot<MediaItem> snapshot) {
          var nowPlaying =
              Provider.of<SoundModel>(context).getSound(snapshot.data?.id);
          return (nowPlaying != null)
              ? Container(
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide()),
                  ),
                  child: IntrinsicHeight(
                      child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(
                                flex: 9,
                                child: GestureDetector(
                                    onTap: () {
                                      Navigator.pushNamedAndRemoveUntil(
                                          context,
                                          '/playing',
                                          (route) =>
                                              '/' == route.settings.name);
                                    },
                                    child: Container(
                                        padding: EdgeInsets.all(20),
                                        color: Colors.blue,
                                        child: Column(
                                          children: [
                                            Text(
                                              nowPlaying.text,
                                              textScaleFactor: 1.25,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            Text(
                                              nowPlaying.username,
                                              textScaleFactor: 0.75,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            )
                                          ],
                                          mainAxisSize: MainAxisSize.min,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                        )))),
                            Expanded(
                                flex: 2,
                                child: GestureDetector(
                                    onTap: () {
                                      if (AudioService
                                              .playbackState.basicState ==
                                          BasicPlaybackState.playing) {
                                        AudioService.pause();
                                      } else {
                                        AudioService.play();
                                      }
                                    },
                                    child: Container(
                                        color: Colors.red,
                                        child: StreamBuilder(
                                            stream: AudioService
                                                .playbackStateStream,
                                            builder: (_, snapshot) => snapshot
                                                        .data?.basicState ==
                                                    BasicPlaybackState.playing
                                                ? Icon(Icons.pause, size: 40)
                                                : Icon(Icons.play_arrow,
                                                    size: 40)))))
                          ],
                          mainAxisAlignment: MainAxisAlignment.spaceBetween)))
              : Container(height: 0);
        });
  }
}

class ComposePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("homophone"),
      ),
      bottomNavigationBar: NowPlayingBar(),
      body: ComposeBody(),
    );
  }
}

class PlayingPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("homophone"), actions: [ProfileIcon()]),
      body: PlayingBody(),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Color.fromRGBO(0, 0, 0, 1),
        label: Text("Compose"),
        tooltip: "Compose",
        onPressed: () {
          Navigator.pushNamed(context, '/compose');
        },
        icon: Icon(Icons.add),
        elevation: 4,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  void initState() {
    Provider.of<SoundModel>(context, listen: false).getProfileSounds();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var sounds = Provider.of<SoundModel>(context).profileSounds();
    return Scaffold(
      appBar: AppBar(title: Text("homophone")),
      body: ProfileBody(sounds: sounds),
      bottomNavigationBar: NowPlayingBar(),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Color.fromRGBO(0, 0, 0, 1),
        label: Text("Compose"),
        tooltip: "Compose",
        onPressed: () {
          Navigator.pushNamed(context, '/compose');
        },
        icon: Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({
    Key key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("homophone"), actions: [ProfileIcon()]),
      body: HomeBody(),
      bottomNavigationBar: NowPlayingBar(),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Color.fromRGBO(0, 0, 0, 1),
        label: Text("Compose"),
        tooltip: "Compose",
        onPressed: () {
          Navigator.pushNamed(context, '/compose');
        },
        icon: Icon(Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}
