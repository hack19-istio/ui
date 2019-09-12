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
    "bass2",
    "hh1",
    "kicksnare1",
    "pad1",
    "piano1",
    "piano2"
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.soundList.forEach(soundName => {
      this.sounds[soundName] = {
        sound: new Howl({
          src: [`http://35.188.57.69/instrument-file?name=${soundName}`],
          format: ["mp3"],
          loop: true
        }),
        play: false,
        offline: false
      };
    });
    this.ctxMagic();
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
      .get(`http://35.188.57.69/instrument?name=${name}`, {
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

  private ctxMagic() {
    // Create analyzer
    var analyser = Howler.ctx.createAnalyser();

    // Connect master gain to analyzer
    Howler.masterGain.connect(analyser);

    // Connect analyzer to destination
    analyser.connect(Howler.ctx.destination);

    // Creating output array (according to documentation https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    // Get the Data array
    analyser.getByteTimeDomainData(dataArray);

    // Display array on time each 3 sec (just to debug)
    setInterval(function() {
      analyser.getByteTimeDomainData(dataArray);
      console.dir(dataArray);
    }, 3000);

    var canvas = <any>document.getElementById("oscilloscope");
    var canvasCtx = canvas.getContext("2d");

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgb(255, 255, 255)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";

      canvasCtx.beginPath();

      var sliceWidth = (canvas.width * 1.0) / bufferLength;
      var x = 0;

      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }

    draw();
  }
}
