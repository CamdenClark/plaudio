import React, { useCallback, useEffect, useRef, useState } from "react";

import { Sound } from "@plaudio/common";
import AudioServiceContext from "./context";

import { api } from "../../sources/API";

type AudioState = {
  playing: boolean;
  duration: number;
  currentTime: number;
};

export const AudioService = (props: any) => {
  const player = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState({} as AudioState);
  const [queue, setQueue] = useState([] as Sound[]);
  const [queuePosition, setQueuePosition] = useState(0);

  const { current } = player;

  const loadSounds = useCallback(
    (next: boolean, soundId?: string) => {
      if (soundId) {
        api.loadSound(soundId).then((sound) => {
          const existing = new Set(queue.map((s) => s.soundId));
          if (!existing.has(sound.soundId)) {
            setQueue([sound, ...queue]);
            if (next) {
              setQueuePosition(queuePosition + 1);
            }
          }
        });
      } else {
        api.loadSounds(0).then((sounds) => {
          const existing = new Set(queue.map((s) => s.soundId));
          const soundsToInsert = sounds.filter((s) => !existing.has(s.soundId));
          setQueue([...queue, ...soundsToInsert]);
          if (next && queuePosition < queue.length - 1) {
            setQueuePosition(queuePosition + 1);
          }
        });
      }
    },
    [queue, queuePosition, setQueue, setQueuePosition]
  );

  const onNext = useCallback(() => {
    if (queuePosition < queue.length - 1) {
      setQueuePosition(queuePosition + 1);
    } else {
      loadSounds(true);
    }
  }, [loadSounds, queue, queuePosition]);

  const anySound = queuePosition >= 0 && queuePosition < queue.length;
  const sound = anySound ? queue[queuePosition] : null;

  useEffect(() => {
    if (current) {
      const endedListener = (_: any) => {
        onNext();
      };
      current.addEventListener("ended", endedListener);

      return () => {
        current.removeEventListener("ended", endedListener);
      };
    }
  }, [current, onNext]);

  useEffect(() => {
    if (current) {
      const timeUpdate = (event: any) => {
        const audioElement = event.target as HTMLAudioElement;
        const { currentTime, duration } = audioElement;
        setAudioState({ ...audioState, currentTime, duration });
      };

      const durationChange = (event: any) => {
        const audioElement = event.target as HTMLAudioElement;
        const { currentTime, duration } = audioElement;
        setAudioState({ ...audioState, currentTime, duration });
      };

      current.addEventListener("timeupdate", timeUpdate);
      current.addEventListener("durationchange", durationChange);

      return () => {
        current.removeEventListener("timeupdate", timeUpdate);
        current.removeEventListener("durationchange", durationChange);
      };
    }
  }, [audioState, current, setAudioState]);

  const onPause = useCallback(() => {
    if (current) {
      current.pause();
      setAudioState({ ...audioState, playing: false });
    }
  }, [audioState, current, setAudioState]);

  const onPlay = useCallback(() => {
    if (current) {
      current.play();
      setAudioState({ ...audioState, playing: true });
    }
  }, [audioState, current, setAudioState]);

  const onPrevious = () => {
    if (queuePosition > 0) {
      setQueuePosition(queuePosition - 1);
    }
  };

  useEffect(() => {
    if (current && sound && current.src !== sound.url) {
      current.src = sound.url;
      if (audioState.playing) {
        current.play();
      }
    }
  }, [audioState, current, onPause, onPlay, sound]);

  const context = {
    audioState,
    loadSounds,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    queue,
    queuePosition,
    sound,
  };

  return (
    <AudioServiceContext.Provider value={context}>
      <audio ref={player} />
      {props.children}
    </AudioServiceContext.Provider>
  );
};
