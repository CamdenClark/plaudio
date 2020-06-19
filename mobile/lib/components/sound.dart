import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'package:homophone/models/sound.dart';

class ListSound extends StatelessWidget {
  ListSound({
    Key key,
    this.sound,
    this.startPlaying,
  }) : super(key: key);

  final Sound sound;
  final Function() startPlaying;

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(
          child: GestureDetector(
              onTap: startPlaying,
              child: Container(
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(width: 1.0),
                    top: BorderSide(width: 1.0),
                  ),
                ),
                padding: EdgeInsets.all(20),
                margin: EdgeInsets.fromLTRB(0, 0, 0, 20),
                child: AbstractSound(sound: sound),
              )))
    ]);
  }
}

class AbstractSound extends StatelessWidget {
  const AbstractSound({Key key, this.sound}) : super(key: key);

  final Sound sound;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Text.rich(TextSpan(
            text: 'from user ',
            style: TextStyle(color: Color.fromRGBO(100, 100, 100, 0.4)),
            children: <InlineSpan>[
              TextSpan(
                  text: sound.username,
                  style: TextStyle(fontWeight: FontWeight.bold))
            ])),
        Text(
          sound.text,
          textScaleFactor: 2.0,
          softWrap: true,
          overflow: TextOverflow.ellipsis,
          maxLines: 5,
        ),
      ],
    );
  }
}
