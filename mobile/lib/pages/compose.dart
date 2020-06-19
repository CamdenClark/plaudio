import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:homophone/models/sound.dart';

class ComposeBody extends StatefulWidget {
  @override
  _ComposeBodyState createState() => _ComposeBodyState();
}

class _ComposeBodyState extends State<ComposeBody> {
  String _text = "";

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                  flex: 2,
                  child: Container(
                      padding: EdgeInsets.fromLTRB(0, 0, 10, 0),
                      child: Text(
                        "Remember, this will be read out loud. Only use letters, numbers, and basic punctuation!",
                        style: TextStyle(
                            color: Color.fromRGBO(100, 100, 100, 0.75)),
                        softWrap: true,
                      ))),
              Expanded(
                  flex: 1,
                  child: RaisedButton(
                    child: Text("Submit"),
                    onPressed: () {
                      Provider.of<SoundModel>(context, listen: false)
                          .submitSound(_text);
                      Navigator.pop(context);
                    },
                  ))
            ],
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
          ),
          Row(children: [
            Expanded(
                child: TextField(
                    autofocus: true,
                    minLines: 5,
                    maxLines: 10,
                    onChanged: (text) {
                      setState(() {
                        log("test");
                        _text = text;
                      });
                    },
                    decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: 'What do you want to say?')))
          ]),
        ],
      ),
    );
  }
}
