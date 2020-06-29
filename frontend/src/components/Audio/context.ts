import React from "react";
import AudioService from "./service";

const AudioServiceContext: React.Context<AudioService> = React.createContext<
  AudioService
>(new AudioService());

export default AudioServiceContext;
