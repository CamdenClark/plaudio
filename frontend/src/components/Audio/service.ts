class AudioService {
  player: HTMLAudioElement = new Audio();
  onEnded: (event: Event) => void = (event) => {};
  onTimeUpdate: (event: Event) => void = (event) => {};

  AudioService() {}

  pause = () => {
    this.player.pause();
  };

  play = () => {
    this.player.play();
  };

  updateSource = (url: string, resume: boolean) => {
    this.pause();
    this.player.src = url;
    if (resume) {
      this.play();
    }
  };

  setOnTimeUpdate = (onTimeUpdate: (event: Event) => void) => {
    this.player.removeEventListener("timeupdate", this.onTimeUpdate);
    this.onTimeUpdate = onTimeUpdate;
    this.player.addEventListener("timeupdate", this.onTimeUpdate);
  };

  setOnEnded = (onEnded: (event: Event) => void) => {
    this.player.removeEventListener("ended", this.onEnded);
    this.onEnded = onEnded;
    this.player.addEventListener("ended", this.onEnded);
  };
}

export default AudioService;
