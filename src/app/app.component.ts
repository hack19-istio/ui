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

  ngOnInit() {
    this.sounds["communicator"] = {
      sound: new Howl({
        src: ["http://localhost:3000/"],
        format: ["mp3"],
        loop: true
      }),
      loop: false
    };
    this.sounds["wololo"] = {
      sound: new Howl({
        src: ["http://localhost:3000/wololo"],
        format: ["mp3"],
        loop: true
      }),
      loop: false
    };
  }

  playLoop(name) {
    this.sounds[name].loop
      ? this.sounds[name].sound.stop()
      : this.sounds[name].sound.play();
    this.sounds[name].loop = !this.sounds[name].loop;
  }
}
