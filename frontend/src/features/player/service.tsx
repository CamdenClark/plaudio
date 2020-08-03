import React, { useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { next, updatePlayState } from "./playerSlice";
import { RootState } from "../../store";

export const AudioService = (props: any) => {
  const player = useRef<HTMLAudioElement | null>(null);
  const dispatch = useDispatch();
  const sound = useSelector((state: RootState) => state.player.current);
  const playing = useSelector((state: RootState) => state.player.playing);

  const { current } = player;

  useEffect(() => {
    if (current) {
      const endedListener = (_: any) => {
        dispatch(next());
      };
      current.addEventListener("ended", endedListener);

      return () => {
        current.removeEventListener("ended", endedListener);
      };
    }
  }, [current, dispatch]);

  useEffect(() => {
    if (current) {
      const timeUpdate = (event: any) => {
        const audioElement = event.target as HTMLAudioElement;
        const { currentTime } = audioElement;
        dispatch(updatePlayState({ currentTime }));
      };

      current.addEventListener("timeupdate", timeUpdate);

      return () => {
        current.removeEventListener("timeupdate", timeUpdate);
      };
    }
  }, [current, dispatch]);

  useEffect(() => {
    if (current) {
      if (playing) {
        current.play();
      } else {
        current.pause();
      }
    }
  }, [current, playing]);

  useEffect(() => {
    if (current && sound && current.src !== sound.url) {
      current.src = sound.url;
      if (playing) {
        current.play();
      }
    }
  }, [current, playing, sound]);

  console.log("Rerender");

  return (
    <>
      <audio ref={player} />
      {props.children}
    </>
  );
};
