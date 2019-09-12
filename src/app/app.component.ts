import { Component, OnInit } from "@angular/core";
import { Howl, Howler } from "howler";
import { HttpClient } from "@angular/common/http";

// istio-k8s-cluster-1
// const clusterHost = '35.188.57.69';
// istio-k8s-cluster-2
// const clusterHost = "35.226.139.104";
// istio-k8s-cluster-3
const clusterHost = "35.238.230.226";

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
  instrumentList = ["rhodes", "bass", "hh", "kicksnare", "pad", "piano"];
  instrumentStates = {
    rhodes: { offline: false, playing: false, sound: null },
    bass: { offline: false, playing: false, sound: null },
    hh: { offline: false, playing: false, sound: null },
    kicksnare: { offline: false, playing: false, sound: null },
    pad: { offline: false, playing: false, sound: null },
    piano: { offline: false, playing: false, sound: null }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.soundList.forEach(soundName => {
      this.sounds[soundName] = {
        sound: new Howl({
          src: [`http://${clusterHost}/instrument-file?name=${soundName}`],
          format: ["mp3"],
          loop: true
        })
      };
    });
    this.ctxMagic();
  }

  playLoop(instrumentName, $event) {
    $event.checked
      ? this.activateInstrument(instrumentName)
      : this.deactivateSound(instrumentName);
  }

  changeMasterVolume(event) {
    Howler.volume(event.value);
  }

  changeSoundVolume(soundName, event) {
    if (soundName) {
      this.sounds[soundName].sound.volume(event.value);
    }
  }

  isInstrumentPlaying(instrumentName) {
    return this.instrumentStates[instrumentName].play;
  }
  isInstrumentOffline(instrumentName) {
    return this.instrumentStates[instrumentName].offline;
  }

  private getSoundForInstrument(instrumentName) {
    return this.instrumentStates[instrumentName].sound;
  }

  private activateInstrument(instrumentName) {
    const onSuccess = data => {
      this.instrumentStates[instrumentName].play = true;
      this.instrumentStates[instrumentName] = {
        ...this.instrumentStates[instrumentName],
        sound: data.name,
        offline: false,
        play: true
      };
      this.restartAllSounds();
    };
    const onError = () => {
      this.instrumentStates[instrumentName].offline = true;
      this.instrumentStates[instrumentName].play = false;
    };
    this.http
      .get(`http://${clusterHost}/instrument?name=${instrumentName}`)
      .subscribe(onSuccess, onError);
  }

  private deactivateSound(instrumentName) {
    console.log("deactivate");
    if (!this.isInstrumentOffline(instrumentName)) {
      this.instrumentStates[instrumentName].play = false;
      this.restartAllSounds();
    } else {
      this.instrumentStates[instrumentName].offline = false;
      this.instrumentStates[instrumentName].play = false;
    }
  }

  private restartAllSounds() {
    this.stopAllSounds();
    this.playAllActivatedInstruments();
  }

  private stopAllSounds() {
    Object.keys(this.sounds).forEach(key => {
      this.sounds[key].sound.stop();
    });
  }

  private playAllActivatedInstruments() {
    this.instrumentList.forEach(instrumentName => {
      if (
        this.isInstrumentPlaying(instrumentName) &&
        !this.instrumentStates[instrumentName].offline
      ) {
        const soundName = this.getSoundForInstrument(instrumentName);
        if (soundName) {
          this.sounds[soundName].sound.play();
        }
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
