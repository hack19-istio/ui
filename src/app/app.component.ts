import { Component, OnInit } from "@angular/core";
import { Howl, Howler } from "howler";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "hack19-istio-ui";
  sounds = {};
  soundList = ["Rhodes", "Bass", "HH", "KickSnare", "Pad", "Piano"];

  ngOnInit() {
    this.soundList.forEach(soundName => {
      this.sounds[soundName] = {
        sound: new Howl({
          src: [`http://localhost:3000/instrument-file?name=${soundName}`],
          format: ["mp3"],
          loop: true
        }),
        play: false
      };
    });
  }

  playLoop(name) {
    this.stopAllSounds();
    this.sounds[name].play = !this.sounds[name].play;
    this.playAllActivatedSounds();
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
      }
    });
  }
}
