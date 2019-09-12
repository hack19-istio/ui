import { Component, OnInit } from "@angular/core";
import { Howl, Howler } from "howler";
import { HttpClient } from "@angular/common/http";

// istio-k8s-cluster-1
// const clusterHost = '35.188.57.69';
// istio-k8s-cluster-2
const clusterHost = "35.226.139.104";

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
  instrumentOffline = {
    rhodes: false,
    bass: false,
    hh: false,
    kicksnare: false,
    pad: false,
    piano: false
  };
  instrumentPlaying = {
    rhodes: false,
    bass: false,
    hh: false,
    kicksnare: false,
    pad: false,
    piano: false
  };
  currentInstrumentSounds = {
    rhodes: null,
    bass: null,
    hh: null,
    kicksnare: null,
    pad: null,
    piano: null
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
    return this.instrumentPlaying[instrumentName];
  }
  isInstrumentOffline(instrumentName) {
    return this.instrumentOffline[instrumentName];
  }

  private getSoundForInstrument(instrumentName) {
    return this.currentInstrumentSounds[instrumentName];
  }

  private activateInstrument(instrumentName) {
    console.log("activate");
    this.instrumentPlaying[instrumentName] = true;
    const onSuccess = data => {
      this.currentInstrumentSounds[instrumentName] = data.name;
      this.instrumentOffline[instrumentName] = false;
      this.instrumentPlaying[instrumentName] = true;
      this.restartAllSounds();
    };
    const onError = () => {
      this.instrumentOffline[instrumentName] = true;
      this.isInstrumentPlaying[instrumentName] = false;
    };
    this.http
      .get(`http://${clusterHost}/instrument?name=${instrumentName}`)
      .subscribe(onSuccess, onError);
  }

  private deactivateSound(instrumentName) {
    console.log("deactivate");
    if (!this.isInstrumentOffline(instrumentName)) {
      this.instrumentPlaying[instrumentName] = false;
      this.restartAllSounds();
    } else {
      this.instrumentOffline[instrumentName] = false;
      this.instrumentPlaying[instrumentName] = false;
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
      console.log("instrumentName", instrumentName);
      if (
        this.instrumentPlaying[instrumentName] &&
        !this.instrumentOffline[instrumentName]
      ) {
        const soundName = this.getSoundForInstrument(instrumentName);
        console.log("soundName", soundName);
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
