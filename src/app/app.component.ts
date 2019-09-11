import { Component, OnInit } from "@angular/core";
import { Howl, Howler } from "howler";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "hack19-istio-ui";
  sounds = {};
  soundList = [
    "rhodes1",
    "bass1",
    "hh1",
    "kickSnare1",
    "pad1",
    "piano1",
    "piano2",
    "asd"
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.soundList.forEach(soundName => {
      this.sounds[soundName] = {
        sound: new Howl({
          src: [`http://localhost:3000/instrument-file?name=${soundName}`],
          format: ["mp3"],
          loop: true
        }),
        play: false,
        offline: false
      };
    });
  }

  playLoop(name) {
    this.soundToggledOn(name)
      ? this.activateSound(name)
      : this.deactivateSound(name);
  }

  private activateSound(name) {
    const onSuccess = () => {
      this.togglePlay(name);
      this.restartAllSounds(name);
    };
    const onError = () => {
      this.sounds[name].play = !this.sounds[name].play;
      this.sounds[name].offline = true;
    };
    this.http
      .get(`http://localhost:3000/instrument-file?name=${name}`, {
        responseType: "blob"
      })
      .subscribe(onSuccess, onError);
  }

  private deactivateSound(name) {
    if (!this.sounds[name].offline) {
      this.togglePlay(name);
      this.restartAllSounds(name);
    } else {
      this.togglePlay(name);
    }
  }

  private soundToggledOn(name) {
    return !this.sounds[name].play;
  }

  private restartAllSounds(name) {
    this.stopAllSounds();
    this.playAllActivatedSounds();
  }

  private togglePlay(name) {
    this.sounds[name].offline = false;
    this.sounds[name].play = !this.sounds[name].play;
  }

  private stopAllSounds() {
    Object.keys(this.sounds).forEach(key => {
      this.sounds[key].sound.stop();
    });
  }

  private playAllActivatedSounds() {
    Object.keys(this.sounds).forEach(key => {
      if (this.sounds[key].play) {
        this.sounds[key].sound.play();
        this.sounds[key].sound.on("end", () => console.log(key + " finished"));
      }
    });
  }
}
