import { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  Clock,
  Compass,
  Sliders,
  Moon,
  Menu,
  X,
  Star,
  CheckCircle,
  Droplet,
  Wind,
  Zap,
  Flame,
  Volume2,
  Download,
  Smartphone,
  Share2,
  Heart,
  Sun,
  CloudRain,
  MapPin,
  Calendar,
  Award,
  ChevronRight,
  ChevronLeft,
  Shield,
  Layers,
  Sparkles,
  WifiOff,
  Snowflake,
  Music,
  Bell
} from 'lucide-react'

// Web Audio Synth Engine
class AmbientSynthEngine {
  constructor() {
    this.ctx = null;
    this.sources = {}; // active nodes
    this.gains = {};   // volume control nodes
    this.thunderTimeout = null;
    this.fireTimeout = null;
    this.birdsTimeout = null;
    this.musicTimeout = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  setVolume(soundId, volume) {
    if (!this.ctx) return;
    const gainNode = this.gains[soundId];
    if (gainNode) {
      // Linear volume mapping 0-100 to 0.0-1.0
      gainNode.gain.setValueAtTime(volume / 100, this.ctx.currentTime);
    }
  }

  start(soundId, volume) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.sources[soundId]) return; // already playing

    // Create Gain Node
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume / 100, this.ctx.currentTime);
    gainNode.connect(this.ctx.destination);
    this.gains[soundId] = gainNode;

    const sourceNodes = [];

    // Synthesize based on soundId
    if (soundId === 'rain') {
      // White noise buffer
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to shape the rain sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 1;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();

      sourceNodes.push(whiteNoise);
    }
    else if (soundId === 'wind') {
      // White noise filter sweeps
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      // Slow LFO to sweep filter frequency for wind gusts
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.15; // 0.15 Hz
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 150;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      
      lfo.start();
      whiteNoise.start();

      sourceNodes.push(whiteNoise, lfo);
    }
    else if (soundId === 'thunder') {
      // Thunder rumbler trigger loop
      const triggerThunder = () => {
        if (!this.gains[soundId]) return; // stopped
        
        // Low frequency noise sweep
        const bufferSize = 3 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(80, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 2.5);

        const thunderGain = this.ctx.createGain();
        thunderGain.gain.setValueAtTime(0, this.ctx.currentTime);
        thunderGain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.1);
        thunderGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.8);

        noise.connect(filter);
        filter.connect(thunderGain);
        thunderGain.connect(gainNode);

        noise.start();
        
        // Schedule next thunder in 12-25 seconds
        const nextTime = 12000 + Math.random() * 13000;
        this.thunderTimeout = setTimeout(triggerThunder, nextTime);
      };
      
      triggerThunder();
    }
    else if (soundId === 'fire') {
      // Campfire: low rumble noise + crackle pop clicks
      // Rumble
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const rumbleNoise = this.ctx.createBufferSource();
      rumbleNoise.buffer = noiseBuffer;
      rumbleNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 180;
      filter.Q.value = 1.5;

      rumbleNoise.connect(filter);
      filter.connect(gainNode);
      rumbleNoise.start();
      sourceNodes.push(rumbleNoise);

      // Crackles
      const crackleTrigger = () => {
        if (!this.gains[soundId]) return;
        
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 1500, this.ctx.currentTime);
        
        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(0, this.ctx.currentTime);
        crackleGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.002);
        crackleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

        osc.connect(crackleGain);
        crackleGain.connect(gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.02);

        const nextCrackle = 50 + Math.random() * 350;
        this.fireTimeout = setTimeout(crackleTrigger, nextCrackle);
      };

      crackleTrigger();
    }
    else if (soundId === 'ocean') {
      // Slow swell filter sweep
      const bufferSize = 4 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 250;

      // 0.08 Hz slow swell LFO
      const swellLFO = this.ctx.createOscillator();
      swellLFO.frequency.value = 0.08;
      
      const swellGain = this.ctx.createGain();
      swellGain.gain.value = 180;

      swellLFO.connect(swellGain);
      swellGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);
      
      swellLFO.start();
      noise.start();

      sourceNodes.push(noise, swellLFO);
    }
    else if (soundId === 'birds') {
      // Birds chirping loop
      const triggerChirp = () => {
        if (!this.gains[soundId]) return;
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        
        const baseFreq = 2200 + Math.random() * 800;
        osc.frequency.setValueAtTime(baseFreq, now);
        // Bird tweet pitch envelope
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 1000, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq - 500, now + 0.15);

        const chirpGain = this.ctx.createGain();
        chirpGain.gain.setValueAtTime(0, now);
        chirpGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(chirpGain);
        chirpGain.connect(gainNode);

        osc.start();
        osc.stop(now + 0.2);

        // Schedule next chirp
        const nextTime = 3000 + Math.random() * 5000;
        this.birdsTimeout = setTimeout(triggerChirp, nextTime);
      };

      triggerChirp();
    }
    else if (soundId === 'snow') {
      // Blizzard wind gusts (Higher pitch noise bandpass)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 0.5;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.25;

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 400;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);

      lfo.start();
      noise.start();

      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'music') {
      // Soothing warm chord progression synthesis
      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
        [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
        [174.61, 220.00, 261.63, 349.23], // Fmaj7 (F3, A3, C4, F4)
        [196.00, 246.94, 293.66, 392.00]  // G6 (G3, B3, D4, G4)
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (!this.gains[soundId]) return;
        
        const now = this.ctx.currentTime;
        const currentChord = chords[chordIndex];
        const chordGain = this.ctx.createGain();
        chordGain.gain.setValueAtTime(0, now);
        chordGain.gain.linearRampToValueAtTime(0.12, now + 2.0); // 2 sec attack
        chordGain.gain.setValueAtTime(0.12, now + 6.0);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 9.8); // release

        chordGain.connect(gainNode);

        currentChord.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle'; // warm woodwind sound
          osc.frequency.setValueAtTime(freq, now);

          // Add a subtle detuned second oscillator for chorus effect
          const detune = this.ctx.createOscillator();
          detune.type = 'sine';
          detune.frequency.setValueAtTime(freq + Math.random() * 0.5, now);
          
          osc.connect(chordGain);
          detune.connect(chordGain);
          
          osc.start();
          detune.start();
          osc.stop(now + 10.0);
          detune.stop(now + 10.0);
        });

        chordIndex = (chordIndex + 1) % chords.length;

        // Schedule next chord in 10 seconds
        this.musicTimeout = setTimeout(playChord, 10000);
      };

      playChord();
    }
    else if (soundId === 'dunes_wind') {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 350;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 100;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      noise.connect(lowpass);
      lowpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'sand_drift') {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 2200;
      bandpass.Q.value = 2.0;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 600;

      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      noise.connect(bandpass);
      bandpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'campfire') {
      this.start('fire', volume);
      return;
    }
    else if (soundId === 'tent_fabric') {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 120;
      filter.Q.value = 1.0;

      const ampLFO = this.ctx.createOscillator();
      ampLFO.frequency.value = 5.0;
      const ampGain = this.ctx.createGain();
      ampGain.gain.value = 0.3;

      const nodGain = this.ctx.createGain();
      nodGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      ampLFO.connect(ampGain);
      ampGain.connect(nodGain.gain);

      noise.connect(filter);
      filter.connect(nodGain);
      nodGain.connect(gainNode);

      ampLFO.start();
      noise.start();
      sourceNodes.push(noise, ampLFO);
    }
    else if (soundId === 'oud') {
      const scale = [220.00, 233.08, 293.66, 311.13, 392.00, 415.30, 466.16, 523.25];
      const playOud = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        const freq = scale[Math.floor(Math.random() * scale.length)];
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);

        const noteGain = this.ctx.createGain();
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.5, now + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start();
        osc.stop(now + 0.9);

        const nextTime = 600 + Math.random() * 1800;
        this.oudTimeout = setTimeout(playOud, nextTime);
      };
      playOud();
    }
    else if (soundId === 'ney') {
      const scale = [293.66, 329.63, 369.99, 392.00, 440.00];
      let noteIndex = 0;
      const playNey = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const freq = scale[noteIndex];
        osc.frequency.setValueAtTime(freq, now);

        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 0.15;
        }
        const breath = this.ctx.createBufferSource();
        breath.buffer = noiseBuffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, now);

        const vib = this.ctx.createOscillator();
        vib.frequency.value = 5.2;
        const vibGain = this.ctx.createGain();
        vibGain.gain.value = 1.8;

        vib.connect(vibGain);
        vibGain.connect(osc.frequency);

        const neyGain = this.ctx.createGain();
        neyGain.gain.setValueAtTime(0, now);
        neyGain.gain.linearRampToValueAtTime(0.3, now + 1.0);
        neyGain.gain.setValueAtTime(0.3, now + 4.5);
        neyGain.gain.exponentialRampToValueAtTime(0.001, now + 6.0);

        osc.connect(neyGain);
        breath.connect(filter);
        filter.connect(neyGain);
        
        neyGain.connect(gainNode);

        osc.start();
        breath.start();
        vib.start();

        osc.stop(now + 6.0);
        breath.stop(now + 6.0);
        vib.stop(now + 6.0);

        noteIndex = (noteIndex + 1) % scale.length;
        this.neyTimeout = setTimeout(playNey, 5500);
      };
      playNey();
    }
    else if (soundId === 'crickets') {
      const playCrickets = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const chirpCount = 3 + Math.floor(Math.random() * 3);
        const baseTime = now;
        
        for (let i = 0; i < chirpCount; i++) {
          const startTime = baseTime + i * 0.08;
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4500 + Math.random() * 200, startTime);
          
          const chirpGain = this.ctx.createGain();
          chirpGain.gain.setValueAtTime(0, startTime);
          chirpGain.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
          
          osc.connect(chirpGain);
          chirpGain.connect(gainNode);
          osc.start(startTime);
          osc.stop(startTime + 0.05);
        }

        const nextTime = 600 + Math.random() * 1200;
        this.cricketsTimeout = setTimeout(playCrickets, nextTime);
      };
      playCrickets();
    }
    else if (soundId === 'night_ambient') {
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 65.41;

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 98.00;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 100;

      const lowGain = this.ctx.createGain();
      lowGain.gain.value = 0.5;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(lowGain);
      lowGain.connect(gainNode);

      osc1.start();
      osc2.start();
      sourceNodes.push(osc1, osc2);
    }
    else if (soundId === 'camel_bells') {
      const playBells = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);

        const modulator = this.ctx.createOscillator();
        modulator.frequency.setValueAtTime(1800, now);
        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(300, now);

        modulator.connect(modGain);
        modGain.connect(osc.frequency);

        const bellGain = this.ctx.createGain();
        bellGain.gain.setValueAtTime(0, now);
        bellGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(bellGain);
        bellGain.connect(gainNode);

        modulator.start();
        osc.start();
        modulator.stop(now + 1.3);
        osc.stop(now + 1.3);

        const nextTime = 4000 + Math.random() * 6000;
        this.camelBellsTimeout = setTimeout(playBells, nextTime);
      };
      playBells();
    }
    else if (soundId === 'falcon') {
      const playFalcon = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.35);

        const cryGain = this.ctx.createGain();
        cryGain.gain.setValueAtTime(0, now);
        cryGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        cryGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(cryGain);
        cryGain.connect(gainNode);

        osc.start();
        osc.stop(now + 0.45);

        const nextTime = 25000 + Math.random() * 20000;
        this.falconTimeout = setTimeout(playFalcon, nextTime);
       };
       this.falconTimeout = setTimeout(playFalcon, 8000 + Math.random() * 8000);
    }

    this.sources[soundId] = sourceNodes;
  }

  stop(soundId) {
    if (soundId === 'thunder') clearTimeout(this.thunderTimeout);
    if (soundId === 'fire' || soundId === 'campfire') {
      clearTimeout(this.fireTimeout);
      if (soundId === 'campfire') this.stop('fire');
    }
    if (soundId === 'birds') clearTimeout(this.birdsTimeout);
    if (soundId === 'music') clearTimeout(this.musicTimeout);
    if (soundId === 'oud') clearTimeout(this.oudTimeout);
    if (soundId === 'ney') clearTimeout(this.neyTimeout);
    if (soundId === 'crickets') clearTimeout(this.cricketsTimeout);
    if (soundId === 'camel_bells') clearTimeout(this.camelBellsTimeout);
    if (soundId === 'falcon') clearTimeout(this.falconTimeout);

    const sourceNodes = this.sources[soundId];
    if (sourceNodes) {
      sourceNodes.forEach((node) => {
        try {
          node.stop();
        } catch (e) {
          // already stopped
        }
      });
      delete this.sources[soundId];
    }

    const gainNode = this.gains[soundId];
    if (gainNode) {
      gainNode.disconnect();
      delete this.gains[soundId];
    }
  }

  stopAll() {
    Object.keys(this.sources).forEach((id) => this.stop(id));
  }
}

// Mobile Immersive Hero View
function MobileHeroView({
  activeDestination,
  DESTINATIONS,
  isPlaying,
  togglePlayback,
  activeSounds,
  toggleSound,
  soundVolumes,
  handleVolumeChange,
  timeLeft
}) {
  const [localTime, setLocalTime] = useState('')
  const [localDate, setLocalDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase()
      const day = now.getDate()
      
      setLocalTime(`${hours}:${minutes}`)
      setLocalDate(`TODAY, ${month} ${day}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const dest = DESTINATIONS[activeDestination]
  // Extract number from weather string (e.g. "Warm Rain 24°C" -> "24")
  const tempMatch = dest.weather.match(/\d+/)
  const tempVal = tempMatch ? tempMatch[0] : '24'
  const weatherDesc = dest.weather.replace(/\d+°C|\d+°F/, '').trim()

  // Calculate timer circle circumference
  const radius = 32
  const circ = 2 * Math.PI * radius
  const progressRatio = timeLeft / 2700
  const strokeOffset = circ - (progressRatio * circ)

  return (
    <div className="mobile-immersive-hero">
      {/* Immersive background layer */}
      <div 
        className="mobile-hero-bg"
        style={{ backgroundImage: `url(${dest.image})` }}
      />
      {/* Sun/Moon light glow overlay */}
      <div className={`mobile-hero-glow ${activeDestination === 1 ? 'dunes' : activeDestination === 2 ? 'alpine' : 'forest'}`} />
      
      {/* Night Desert Animations */}
      {activeDestination === 1 && (
        <>
          <div className="dunes-moon-glow" />
          
          {/* Campfire glow & rising sparks only when fire sound is selected */}
          {activeSounds.includes('campfire') && (
            <>
              <div className="dunes-fire-glow" />
              <div className="desert-sparks-overlay">
                <div className="spark-particle s-1" />
                <div className="spark-particle s-2" />
                <div className="spark-particle s-3" />
                <div className="spark-particle s-4" />
                <div className="spark-particle s-5" />
              </div>
            </>
          )}

          {/* Floating music notes only when oud or ney sound is selected */}
          {(activeSounds.includes('oud') || activeSounds.includes('ney')) && (
            <div className="dunes-music-notes-overlay">
              <div className="music-note n-1">♪</div>
              <div className="music-note n-2">♫</div>
              <div className="music-note n-3">♩</div>
              <div className="music-note n-4">♬</div>
            </div>
          )}

          {/* Animated wind haze sweeps only when wind sound is selected */}
          {activeSounds.includes('dunes_wind') && (
            <div className="dunes-wind-overlay">
              <div className="wind-haze-sweep h-1" />
              <div className="wind-haze-sweep h-2" />
              <div className="wind-haze-sweep h-3" />
            </div>
          )}
        </>
      )}
      
      {/* Rain animation overlay */}
      {isPlaying && activeSounds.includes('rain') && (
        <div className="mobile-rain-overlay" />
      )}
      {/* Snow animation overlay */}
      {isPlaying && activeSounds.includes('snow') && (
        <div className="mobile-snow-overlay" />
      )}

      {/* Floating Animated Silhouettes - Camels move only when bells sound is active */}
      {activeDestination === 1 && activeSounds.includes('camel_bells') && (
        <div className="mobile-camel-caravan">
          <svg viewBox="0 0 100 40" fill="currentColor" style={{ width: '80px', height: '30px' }}>
            {/* Camel 1 */}
            <path d="M15,25 Q17,20 18,22 T20,20 T22,23 T25,25 L26,35 L24,35 L23,28 L21,28 L20,35 L18,35 Z" />
            {/* Rope 1-2 */}
            <path d="M25,25 Q30,22 35,23" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            {/* Camel 2 */}
            <path d="M35,23 Q37,18 38,20 T40,18 T42,21 T45,23 L46,33 L44,33 L43,26 L41,26 L40,33 L38,33 Z" />
            {/* Rope 2-3 */}
            <path d="M45,23 Q50,24 55,25" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            {/* Camel 3 */}
            <path d="M55,25 Q57,20 58,22 T60,20 T62,23 T65,25 L66,35 L64,35 L63,28 L61,28 L60,35 L58,35 Z" />
            {/* Lead Rope */}
            <path d="M15,25 Q10,25 6,27" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            {/* Guide Person leading caravan */}
            <circle cx="5" cy="24" r="1.5" />
            <path d="M3,26 L7,26 L8,35 L3,35 Z" />
          </svg>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="mobile-hero-nav" style={{ marginTop: '4.5rem', justifyContent: 'center' }}>
        <div className="mobile-nav-center">
          <span className="mobile-nav-location">
            <MapPin size={14} style={{ marginRight: '4px' }} />
            {dest.title}
          </span>
          <span className="mobile-nav-date">{localDate} • {localTime}</span>
        </div>
      </div>

      {/* Hero Temperature Block */}
      <div className="mobile-hero-temp-block">
        <div className="temp-number-row">
          <span className="temp-number">{tempVal}</span>
          <span className="temp-degree-symbol">°</span>
        </div>
        <span className="temp-subtitle">
          Feels like {parseInt(tempVal) + 2}° • {weatherDesc || 'Calm'}
        </span>
      </div>

      {/* Central Playback & Interactive Ring */}
      <div className="mobile-hero-playback-section">
        <div className="mobile-playback-ring-wrapper">
          <svg className={`timer-svg ${isPlaying ? 'playing' : ''}`} width="90" height="90">
            <circle 
              className="timer-ring-bg"
              cx="45" 
              cy="45" 
              r={radius} 
            />
            <circle 
              className="timer-ring-fill"
              cx="45" 
              cy="45" 
              r={radius}
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
            />
          </svg>
          <button 
            className={`mobile-main-play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayback}
            aria-label={isPlaying ? 'Pause ambient soundscape' : 'Play ambient soundscape'}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>
        </div>
      </div>

      {/* Glassmorphic Sound Drawer Sheet */}
      <div className="mobile-sound-drawer-sheet">
        <div className="drawer-handle" />
        
        <div className="drawer-scroll-container">
          {getMixSounds(activeDestination).map((sound) => {
            const isActive = activeSounds.includes(sound.id)
            const IconComponent = sound.icon
            return (
              <div 
                key={sound.id} 
                className={`drawer-sound-card ${isActive ? 'active' : ''}`}
                onClick={() => toggleSound(sound.id)}
              >
                <div className="sound-card-icon-box">
                  <IconComponent size={24} className="sound-card-icon" />
                </div>
                <span className="sound-card-label">{sound.name}</span>
                {isActive && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolumes[sound.id] || 0}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleVolumeChange(sound.id, Number(e.target.value))}
                    className="drawer-card-volume"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

// Toast Component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="toast" id="toast-notification">
      <CheckCircle className="toast-icon" size={20} />
      <span className="toast-message">{message}</span>
    </div>
  )
}

// Zephyrs (Explore Places) Data
const DESTINATIONS = [
  {
    id: 'forest',
    title: 'Ancient Forest',
    location: 'Costa Rica Rain Forest',
    description: 'Immerse in tropical rainfall and soothing bird chatter under a thick canopy of emerald greens.',
    image: '/ancient_forest.png',
    weather: 'Warm Rain 24°C',
    sounds: ['Rain', 'Birds', 'Wind'],
    volPreset: { rain: 75, birds: 60, wind: 40 }
  },
  {
    id: 'desert',
    title: 'Celestial Dunes',
    location: 'Dubai Sand Dunes',
    description: 'Breathe in the cool desert air as the dry wind whispers over shifting sands under a dome of stars.',
    image: '/celestial_desert.png',
    weather: 'Clear Sky 18°C',
    sounds: ['Desert Wind', 'Drifting Sand', 'Oud Melodies', 'Crickets'],
    volPreset: { dunes_wind: 60, sand_drift: 35, oud: 45, crickets: 40 }
  },
  {
    id: 'alpine',
    title: 'Alpine Peaks',
    location: 'Mountain Valley',
    description: 'Sit beside a roaring glacier stream as gusty mountain winds brush past the snowy heights.',
    image: '/alpine_peaks.png',
    weather: 'Chilly Breeze -2°C',
    sounds: ['Stream', 'Wind', 'Thunder'],
    volPreset: { wind: 70, thunder: 35, rain: 20 }
  },
  {
    id: 'campfire',
    title: 'Campfire Night',
    location: 'Pacific Northwest',
    description: 'Cracking pine logs under an old-growth redwood sky, accompanied by crickets and warm guitar chords.',
    image: '/better_sleep.png',
    weather: 'Clear Twilight 12°C',
    sounds: ['Campfire', 'Crickets', 'Acoustic Lofi'],
    volPreset: { fire: 80, music: 45, wind: 20 }
  },
  {
    id: 'ocean',
    title: 'Deep Ocean',
    location: 'Polynesian Coast',
    description: 'Relax to the slow, heavy rise and fall of giant Pacific waves breaking on a warm sandy shore.',
    image: '/hero_background.png',
    weather: 'Tropical Breeze 26°C',
    sounds: ['Ocean Waves', 'Wind'],
    volPreset: { ocean: 75, wind: 35 }
  },
  {
    id: 'zen',
    title: 'Japanese Garden',
    location: 'Kyoto Sanctuary',
    description: 'Sip tea near a trickling bamboo fountain while cherry blossom petals fall silently into the pond.',
    image: '/study_sessions.png',
    weather: 'Mist Fog 16°C',
    sounds: ['Fountain', 'Soft Lofi', 'Birds'],
    volPreset: { birds: 50, music: 60, rain: 15 }
  }
]

// Bento Scenarios Data
const SCENARIOS = [
  {
    id: 'sleep',
    title: 'Sleep Better',
    desc: 'Melt away daily stress with deep nocturnal storm blends.',
    icon: Moon,
    color: 'bento-shape-1',
    size: 'b-span-7'
  },
  {
    id: 'focus',
    title: 'Deep Focus',
    desc: 'Optimize productivity with forest rain and cosmic brown noise.',
    icon: Sliders,
    color: 'bento-shape-2',
    size: 'b-span-5'
  },
  {
    id: 'meditation',
    title: 'Meditation',
    desc: 'Ground your consciousness using temple bowl notes and wind gusts.',
    icon: Compass,
    color: 'bento-shape-3',
    size: 'b-span-4'
  },
  {
    id: 'reading',
    title: 'Relaxing Reading',
    desc: 'Immerse into cozy cabins, crackling fires and soft ambient music.',
    icon: Flame,
    color: 'bento-shape-1',
    size: 'b-span-8'
  },
  {
    id: 'relax',
    title: 'Nature Escape',
    desc: 'Banish city static by stepping into lush tropical valleys.',
    icon: Droplet,
    color: 'bento-shape-2',
    size: 'b-span-5'
  },
  {
    id: 'study',
    title: 'Study Sessions',
    desc: 'Retain memory with custom sound waves and lofi textures.',
    icon: Award,
    color: 'bento-shape-3',
    size: 'b-span-7'
  }
]

// Mixer Sounds Config
const MIX_SOUNDS = [
  { id: 'rain', name: 'Rainfall', icon: CloudRain, color: '#60a5fa' },
  { id: 'wind', name: 'Wind', icon: Wind, color: '#cbd5e1' },
  { id: 'thunder', name: 'Thunder', icon: Zap, color: '#facc15' },
  { id: 'fire', name: 'Campfire', icon: Flame, color: '#f97316' },
  { id: 'ocean', name: 'Ocean Waves', icon: Droplet, color: '#38bdf8' },
  { id: 'birds', name: 'Forest Birds', icon: BirdIcon, color: '#4ade80' }, // custom icon component
  { id: 'snow', name: 'Snowstorm', icon: Snowflake, color: '#93c5fd' },
  { id: 'music', name: 'Ambient Music', icon: Music, color: '#c084fc' }
]

// Dynamic Mixer Sounds selector
const getMixSounds = (activeDest) => {
  if (activeDest === 1) {
    return [
      { id: 'dunes_wind', name: 'Desert Wind', icon: Wind, color: '#f59e0b' },
      { id: 'sand_drift', name: 'Drifting Sand', icon: Sliders, color: '#fbbf24' },
      { id: 'campfire', name: 'Campfire', icon: Flame, color: '#ea580c' },
      { id: 'tent_fabric', name: 'Tent Flutter', icon: Layers, color: '#94a3b8' },
      { id: 'oud', name: 'Oud Melodies', icon: Music, color: '#a78bfa' },
      { id: 'ney', name: 'Ney Flute', icon: Music, color: '#818cf8' },
      { id: 'crickets', name: 'Crickets', icon: Volume2, color: '#34d399' },
      { id: 'night_ambient', name: 'Night Ambient', icon: Moon, color: '#38bdf8' },
      { id: 'camel_bells', name: 'Camel Bells', icon: Bell, color: '#fb7185' },
      { id: 'falcon', name: 'Falcon Cry', icon: BirdIcon, color: '#f472b6' }
    ];
  }
  return MIX_SOUNDS;
}

// Bird icon fallback component
function BirdIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 4h.01M20 8h.01M12 8h.01M8 12h.01M15 16l-3-3-3 3M19 12l-7-7-7 7M22 22H2" />
    </svg>
  )
}

// Preset Mixes
const PRESET_MIXES = [
  {
    id: 'stormy_night',
    name: 'Mountain Storm',
    sounds: { rain: 80, thunder: 65, wind: 45 }
  },
  {
    id: 'cozy_cabin',
    name: 'Cozy Fireplace',
    sounds: { fire: 85, music: 45, wind: 20 }
  },
  {
    id: 'forest_zen',
    name: 'Forest Zen',
    sounds: { birds: 70, wind: 30, rain: 25 }
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Serenade',
    sounds: { ocean: 80, wind: 35, music: 50 }
  }
]

function App() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [activeDestination, setActiveDestination] = useState(1)

  // Phone Mockup Tilt Effect
  const [tiltStyle, setTiltStyle] = useState({})

  // Audio Playback Mock
  const [isPlaying, setIsPlaying] = useState(false)

  // Sound Mixer States
  const [activeSounds, setActiveSounds] = useState(['dunes_wind', 'sand_drift', 'oud', 'crickets'])
  const [soundVolumes, setSoundVolumes] = useState({
    dunes_wind: 60,
    sand_drift: 35,
    oud: 45,
    crickets: 40,
    rain: 65,
    wind: 40,
    thunder: 30,
    fire: 50,
    ocean: 60,
    birds: 45,
    snow: 30,
    music: 50
  })

  // Selected Preset state
  const [activePreset, setActivePreset] = useState('stormy_night')

  // Sleep Timer Countdown inside App Preview
  const [timeLeft, setTimeLeft] = useState(2700) // 45 minutes
  const timerRef = useRef(null)

  const synthRef = useRef(null)

  // Synchronous web audio system state alignment (bypasses browser autoplay restrictions)
  const syncSynthEngine = (playing, active, volumes) => {
    if (!synthRef.current) return
    if (playing) {
      synthRef.current.init()
      if (synthRef.current.ctx && synthRef.current.ctx.state === 'suspended') {
        synthRef.current.ctx.resume().catch((err) => console.log('AudioContext resume failed:', err))
      }
      active.forEach((soundId) => {
        const vol = volumes[soundId] || 0
        synthRef.current.start(soundId, vol)
        synthRef.current.setVolume(soundId, vol)
      })
      const allPossibleSounds = [...MIX_SOUNDS, ...getMixSounds(1)]
      allPossibleSounds.forEach((snd) => {
        if (!active.includes(snd.id)) {
          synthRef.current.stop(snd.id)
        }
      })
    } else {
      synthRef.current.stopAll()
    }
  }

  // Instantiate the Synth Engine
  useEffect(() => {
    synthRef.current = new AmbientSynthEngine()
    return () => {
      if (synthRef.current) {
        synthRef.current.stopAll()
      }
    }
  }, [])

  // Listen to Scroll position for Day-to-Night gradient
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / (totalHeight || 1)
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen to Mouse Move on Cards to set spotlight variables
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.glass-card, .feature-card, .sound-chip, .bento-card, .premium-card')
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        card.style.setProperty('--mouse-x', `${x}px`)
        card.style.setProperty('--mouse-y', `${y}px`)
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Countdown timer inside App preview
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsPlaying(false)
            if (synthRef.current) {
              synthRef.current.stopAll()
            }
            showToast('Sleep timer finished. Audio paused.')
            return 2700
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  const showToast = (msg) => {
    setToastMessage(msg)
  }

  // 3D Phone Tilt calculation
  const handlePhoneMouseMove = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / rect.height) * 24 // 24deg max tilt
    const rotateY = (x / rect.width) * 24
    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`,
      transition: 'transform 0.08s ease-out'
    })
  }

  const handlePhoneMouseLeave = () => {
    setTiltStyle({
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    })
  }

  // Toggle active sound in mixer
  const toggleSound = (soundId) => {
    let nextActive = [...activeSounds]
    const isActive = nextActive.includes(soundId)
    if (isActive) {
      nextActive = nextActive.filter((id) => id !== soundId)
      showToast(`Removed sound: ${soundId.toUpperCase()}`)
    } else {
      nextActive.push(soundId)
      showToast(`Added sound: ${soundId.toUpperCase()}`)
    }
    setActiveSounds(nextActive)
    syncSynthEngine(isPlaying, nextActive, soundVolumes)
  }

  // Change volume
  const handleVolumeChange = (soundId, value) => {
    setSoundVolumes((prev) => {
      const nextVolumes = { ...prev, [soundId]: value }
      let nextActive = [...activeSounds]
      if (value > 0 && !nextActive.includes(soundId)) {
        nextActive.push(soundId)
      } else if (value === 0 && nextActive.includes(soundId)) {
        nextActive = nextActive.filter((id) => id !== soundId)
      }
      setActiveSounds(nextActive)
      syncSynthEngine(isPlaying, nextActive, nextVolumes)
      return nextVolumes
    })
  }

  // Toggle global play/pause state with toast alerts
  const togglePlayback = () => {
    setIsPlaying((prev) => {
      const nextState = !prev
      showToast(nextState ? 'Ambient Audio playing. Close your eyes and enjoy.' : 'Ambient Audio paused.')
      syncSynthEngine(nextState, activeSounds, soundVolumes)
      return nextState
    })
  }

  // Apply Preset
  const applyPreset = (preset) => {
    setActivePreset(preset.id)
    const active = Object.keys(preset.sounds)
    setActiveSounds(active)
    setSoundVolumes((prev) => {
      const nextVolumes = { ...prev, ...preset.sounds }
      syncSynthEngine(isPlaying, active, nextVolumes)
      return nextVolumes
    })
    showToast(`Preset loaded: ${preset.name}`)
  }

  // Apply a destination zephyr preset
  const selectDestination = (index) => {
    setActiveDestination(index)
    const dest = DESTINATIONS[index]
    const activeKeys = Object.keys(dest.volPreset)
    setActiveSounds(activeKeys)
    setSoundVolumes((prev) => {
      const nextVolumes = { ...prev, ...dest.volPreset }
      syncSynthEngine(isPlaying, activeKeys, nextVolumes)
      return nextVolumes
    })
    showToast(`Exploring destination: ${dest.title}`)
    const mixerEl = document.getElementById('sound-mixer')
    if (mixerEl) {
      mixerEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleNavClick = (sectionId) => {
    setIsMenuOpen(false)
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Interpolate color values for day-to-night background based on scroll ratio
  // Sunset: #0e0a1a -> Twilight: #080616 -> Night: #020108
  let themeBg1 = '#0f0a1c'
  let themeBg2 = '#040307'
  let isNight = false
  if (scrollProgress < 0.25) {
    themeBg1 = '#0f0a1c' // Sunset warm violet
    themeBg2 = '#040307'
  } else if (scrollProgress < 0.55) {
    themeBg1 = '#070514' // Twilight dark purple
    themeBg2 = '#010103'
  } else {
    themeBg1 = '#020109' // Starry midnight navy
    themeBg2 = '#000000'
    isNight = true
  }

  return (
    <>
      {/* Heat Shimmer SVG Filter Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <filter id="heat-shimmer">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.04" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.015 0.04; 0.015 0.06; 0.015 0.04" dur="12s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale={
              activeDestination === 1 
                ? (activeSounds.includes('wind') ? 8 : 0) + (activeSounds.includes('drift') ? 10 : 0) + 3 
                : 5
            } 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>

      {/* Background System */}
      <div
        className={`zephyr-backdrop ${activeDestination === 1 ? 'theme-dunes' : ''}`}
        style={{
          '--theme-bg-1': themeBg1,
          '--theme-bg-2': themeBg2,
          '--theme-glow': isNight ? 'rgba(144, 137, 252, 0.08)' : 'rgba(251, 146, 60, 0.12)'
        }}
      >
        <div className="ambient-glow-blob blob-1" />
        <div className="ambient-glow-blob blob-2" />
        <div className="ambient-glow-blob blob-3" />
        
        {/* Starry Sky Layer - Active during twilight / night */}
        <div className={`nature-stars ${scrollProgress > 0.35 ? 'active' : ''}`} />
        
        {/* Slow moving drifting fireflies */}
        <div className="nature-fireflies">
          <div className="firefly" style={{ left: '15%', animationDelay: '0s', animationDuration: '10s' }} />
          <div className="firefly" style={{ left: '45%', animationDelay: '2s', animationDuration: '14s' }} />
          <div className="firefly" style={{ left: '75%', animationDelay: '5s', animationDuration: '11s' }} />
          <div className="firefly" style={{ left: '30%', animationDelay: '1s', animationDuration: '13s' }} />
          <div className="firefly" style={{ left: '85%', animationDelay: '4s', animationDuration: '12s' }} />
        </div>

        {/* Rain Overlays (If Rain is selected and active in mixer) */}
        {activeSounds.includes('rain') && (
          <div className="nature-rain">
            <div className="rain-stream" style={{ left: '10%', animationDelay: '0s', animationDuration: '0.8s' }} />
            <div className="rain-stream" style={{ left: '25%', animationDelay: '0.4s', animationDuration: '1.2s' }} />
            <div className="rain-stream" style={{ left: '45%', animationDelay: '0.2s', animationDuration: '0.9s' }} />
            <div className="rain-stream" style={{ left: '60%', animationDelay: '0.7s', animationDuration: '1.1s' }} />
            <div className="rain-stream" style={{ left: '80%', animationDelay: '0.1s', animationDuration: '0.9s' }} />
            <div className="rain-stream" style={{ left: '95%', animationDelay: '0.5s', animationDuration: '1.3s' }} />
          </div>
        )}

        {/* Clouds & Fog Layer */}
        <div className="nature-clouds">
          <div className="cloud-layer cloud-1" />
          <div className="cloud-layer cloud-2" />
        </div>
      </div>

      {/* App Header / Navigation */}
      <header className="app-header">
        <div className="header-container">
          <a href="#" className="brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            <span className="brand-name">Zephyr</span>
          </a>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <button className="nav-link" onClick={() => handleNavClick('why-love')}>Why Zephyr</button>
            <button className="nav-link" onClick={() => handleNavClick('sound-mixer')}>Sound Mixer</button>
            <button className="nav-link" onClick={() => handleNavClick('destinations')}>Destinations</button>
            <button className="nav-link" onClick={() => handleNavClick('personalized')}>Scenarios</button>
            <button className="btn btn-primary" onClick={() => handleNavClick('download')}>
              <span>Download App</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Sections */}
      <main style={{ flex: 1 }}>
        
        {/* 1. Hero Section */}
        {isMobile ? (
          <MobileHeroView 
            activeDestination={activeDestination}
            DESTINATIONS={DESTINATIONS}
            isPlaying={isPlaying}
            togglePlayback={togglePlayback}
            activeSounds={activeSounds}
            toggleSound={toggleSound}
            soundVolumes={soundVolumes}
            handleVolumeChange={handleVolumeChange}
            timeLeft={timeLeft}
          />
        ) : (
          <section className="hero-section">
            {/* Subtle sun parallax element */}
            <div className="landscape-sun" style={{ '--sun-y': `${scrollProgress * 200}px` }} />

          {/* Soaring birds */}
          <div className="nature-birds">
            <div className="bird bird-1" />
            <div className="bird bird-2" />
          </div>

          <div className="hero-container">
            <div className="hero-content">
              <div className="badge-pill">
                <div className="badge-dot" />
                <span>Now available on iOS & Android</span>
              </div>
              <h1 className="hero-title">Escape into<br />Sound.</h1>
              <p className="hero-description">
                Mix rainfall, ocean swells, cracking campfires and beautiful illustrated worlds to create your perfect atmosphere for sleep, meditation or focus.
              </p>
              <div className="hero-ctas">
                <button className="btn btn-primary" onClick={() => handleNavClick('download')}>
                  <Download size={18} />
                  <span>Download App</span>
                </button>
                <button className="btn btn-secondary" onClick={() => handleNavClick('destinations')}>
                  <Compass size={18} />
                  <span>Explore Zephyrs</span>
                </button>
              </div>
            </div>

            <div className="hero-visual-panel">
              {/* Dynamic 3D interactive phone mockup */}
              <div
                className="phone-mockup-wrapper"
                onMouseMove={handlePhoneMouseMove}
                onMouseLeave={handlePhoneMouseLeave}
                style={tiltStyle}
              >
                <div className="phone-mockup-3d">
                  <div className="phone-body">
                    <div className="phone-notch" />
                    
                    {/* Inner App UI screen simulation */}
                    <div className="phone-screen">
                      <div
                        className="phone-screen-ambient-bg"
                        style={{
                          backgroundImage: `url(${DESTINATIONS[activeDestination].image})`,
                          opacity: isPlaying ? 0.35 : 0.15
                        }}
                      />
                      {/* Night Desert Animations inside phone preview */}
                      {activeDestination === 1 && (
                        <>
                          <div className="dunes-moon-glow" />
                          
                          {/* Campfire glow & rising sparks only when fire sound is selected */}
                          {activeSounds.includes('fire') && (
                            <>
                              <div className="dunes-fire-glow" />
                              <div className="desert-sparks-overlay">
                                <div className="spark-particle s-1" />
                                <div className="spark-particle s-2" />
                                <div className="spark-particle s-3" />
                                <div className="spark-particle s-4" />
                                <div className="spark-particle s-5" />
                              </div>
                            </>
                          )}

                          {/* Floating music notes only when oud or ney sound is selected */}
                          {(activeSounds.includes('oud') || activeSounds.includes('ney')) && (
                            <div className="dunes-music-notes-overlay">
                              <div className="music-note n-1">♪</div>
                              <div className="music-note n-2">♫</div>
                              <div className="music-note n-3">♩</div>
                              <div className="music-note n-4">♬</div>
                            </div>
                          )}

                          {/* Floating Animated Silhouettes - Camels move only when bells sound is active */}
                          {activeSounds.includes('camel_bells') && (
                            <div className="mobile-camel-caravan">
                              <svg viewBox="0 0 100 40" fill="currentColor" style={{ width: '80px', height: '30px' }}>
                                {/* Camel 1 */}
                                <path d="M15,25 Q17,20 18,22 T20,20 T22,23 T25,25 L26,35 L24,35 L23,28 L21,28 L20,35 L18,35 Z" />
                                {/* Rope 1-2 */}
                                <path d="M25,25 Q30,22 35,23" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                                {/* Camel 2 */}
                                <path d="M35,23 Q37,18 38,20 T40,18 T42,21 T45,23 L46,33 L44,33 L43,26 L41,26 L40,33 L38,33 Z" />
                                {/* Rope 2-3 */}
                                <path d="M45,23 Q50,24 55,25" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                                {/* Camel 3 */}
                                <path d="M55,25 Q57,20 58,22 T60,20 T62,23 T65,25 L66,35 L64,35 L63,28 L61,28 L60,35 L58,35 Z" />
                                {/* Lead Rope */}
                                <path d="M15,25 Q10,25 6,27" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                                {/* Guide Person leading caravan */}
                                <circle cx="5" cy="24" r="1.5" />
                                <path d="M3,26 L7,26 L8,35 L3,35 Z" />
                              </svg>
                            </div>
                          )}

                          {/* Animated wind haze sweeps only when wind sound is selected */}
                          {activeSounds.includes('dunes_wind') && (
                            <div className="dunes-wind-overlay">
                              <div className="wind-haze-sweep h-1" />
                              <div className="wind-haze-sweep h-2" />
                              <div className="wind-haze-sweep h-3" />
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="phone-ui-header">
                        <Sliders size={18} className="phone-ui-title" />
                        <span className="phone-ui-title">Zephyr</span>
                        <Clock size={18} className="phone-ui-title" />
                      </div>

                      <div className="phone-ui-artwork-frame">
                        <img
                          src={DESTINATIONS[activeDestination].image}
                          alt={DESTINATIONS[activeDestination].title}
                          className="phone-ui-artwork"
                          style={{ transform: isPlaying ? 'scale(1.05)' : 'scale(1)' }}
                        />
                      </div>

                      <div className="phone-ui-track-info">
                        <h4 className="phone-ui-track-name">{DESTINATIONS[activeDestination].title}</h4>
                        <span className="phone-ui-track-desc">{DESTINATIONS[activeDestination].location}</span>
                      </div>

                      <div className="phone-ui-controls">
                        {/* Audio Waveform visualization */}
                        <div className="visualizer" style={{ alignSelf: 'center', marginBottom: '1rem' }}>
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0.1s' }} />
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0.4s' }} />
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0s' }} />
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0.3s' }} />
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0.2s' }} />
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0.5s' }} />
                          <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ animationDelay: '0.1s' }} />
                        </div>

                        {/* Interactive sliders list in app */}
                        <div className="phone-ui-sound-sliders">
                          {[
                            { id: 'rain', name: 'Rainfall' },
                            { id: 'wind', name: 'Wind' },
                            { id: 'music', name: 'Ambient Music' }
                          ].map((sound) => (
                            <div key={sound.id} className="phone-ui-slider-row">
                              <span className="phone-ui-slider-label">{sound.name}</span>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={soundVolumes[sound.id] || 0}
                                  onChange={(e) => handleVolumeChange(sound.id, Number(e.target.value))}
                                  className="phone-ui-slider-input"
                                  style={{
                                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${soundVolumes[sound.id] || 0}%, rgba(255,255,255,0.1) ${soundVolumes[sound.id] || 0}%, rgba(255,255,255,0.1) 100%)`
                                  }}
                                  aria-label={`Adjust volume of ${sound.name} inside phone mockup`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="phone-ui-playback-bar">
                          <button
                            className="phone-play-btn"
                            onClick={togglePlayback}
                            aria-label={isPlaying ? 'Pause mix' : 'Play mix'}
                          >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Layered independent parallax support panels */}
                <div className="glass-card parallax-float-card card-layer-1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Droplet size={18} className="toast-icon" />
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Rain active</h5>
                      <span style={{ fontSize: '0.65rem', color: 'var(--c-text-secondary)' }}>Volume: {soundVolumes.rain}%</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card parallax-float-card card-layer-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Clock size={18} className="toast-icon" />
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sleep Timer</h5>
                      <span style={{ fontSize: '0.65rem', color: 'var(--c-text-secondary)' }}>{Math.ceil(timeLeft / 60)}m left</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card parallax-float-card card-layer-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={14} className="toast-icon" style={{ color: 'var(--c-sunset)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ultra Audio 96kHz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 2. Trusted / Featured Section */}
        <section className="trusted-section">
          <h2 className="trusted-label">Featured & Recommended On</h2>
          <div className="trusted-logos">
            <div className="logo-item">
              <Smartphone size={20} />
              <span>App Store Awards</span>
            </div>
            <div className="logo-item">
              <Star size={20} fill="currentColor" />
              <span>Product Hunt #1</span>
            </div>
            <div className="logo-item">
              <Compass size={20} />
              <span>Tech Blogs</span>
            </div>
            <div className="logo-item">
              <Award size={20} />
              <span>Apple Design Nominee</span>
            </div>
          </div>
        </section>

        {/* 3. Why You'll Love It Section */}
        <section className="section" id="why-love">
          <div className="section-header">
            <span className="section-tag">Pure Serenity</span>
            <h2 className="section-title">Designed to soothe your soul.</h2>
            <p className="section-desc">
              Discover beautiful nature sounds layered inside hand-drawn ambient illustrations. Build mixes to create your ultimate auditory refuge.
            </p>
          </div>

          <div className="features-grid">
            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <CloudRain size={24} />
              </div>
              <h3>Immersive Rain</h3>
              <p>Soft forest mist, torrential roof storms, and puddle splatters recorded in high-fidelity stereo.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <Wind size={24} />
              </div>
              <h3>Whispering Wind</h3>
              <p>Alpine drafts, sea breezes, and autumnal canopy sweeps that clear mental static.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <Zap size={24} />
              </div>
              <h3>Distant Thunder</h3>
              <p>Deep rumbling storms that sound realistic, wrapping you in security and peace.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <Flame size={24} />
              </div>
              <h3>Warm Campfire</h3>
              <p>Hear pine log crackling, warm heat waves, and the subtle outdoor hum of old woodlands.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <Droplet size={24} />
              </div>
              <h3>Rolling Ocean</h3>
              <p>Slow ocean surges breaking over pebbles, recorded at sunrise in deep coastal locations.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <BirdIcon size={24} />
              </div>
              <h3>Forest Birds</h3>
              <p>Dawn chorus birds and remote tropical wildlife calls that ground your mind instantly.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <Snowflake size={24} />
              </div>
              <h3>Soft Snow</h3>
              <p>Subtle winter winds and walking snow crunches that evoke absolute quietude.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-glow-overlay" />
              <div className="feature-icon-box">
                <Music size={24} />
              </div>
              <h3>Calming Music</h3>
              <p>Ambient synths, harp strings, and chill acoustic lofi to block distractions.</p>
            </div>
          </div>
        </section>

        {/* 4. Interactive Sound Mixer Section */}
        <section className="section" id="sound-mixer">
          <div className="section-header">
            <span className="section-tag">Interactive Preview</span>
            <h2 className="section-title">Compose your own atmosphere.</h2>
            <p className="section-desc">
              Compose custom sound profiles. Toggle tracks, adjust volume sliders, and save your custom mix presets.
            </p>
          </div>

          <div className="mixer-wrapper">
            <div className="glass-card mixer-dashboard">
              <div className="mixer-header-row">
                <span style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-lavender)' }}>
                  Active Audio Output
                </span>
                
                {/* Playing status toggle */}
                <button
                  className="btn btn-secondary"
                  onClick={togglePlayback}
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Pause Experience' : 'Test Sound'}</span>
                </button>
              </div>

              {/* Dynamic waveform visualizer */}
              <div className="mixer-visualizer-box">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`mixer-waveform-bar ${isPlaying && activeSounds.length > 0 ? 'active' : ''}`}
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.8 + Math.random()}s`,
                      height: isPlaying && activeSounds.length > 0 ? undefined : '6px'
                    }}
                  />
                ))}
              </div>

              {/* Sound toggler chips grid */}
              <div className="sound-chips-grid">
                {getMixSounds(activeDestination).map((sound) => {
                  const isActive = activeSounds.includes(sound.id)
                  return (
                    <div
                      key={sound.id}
                      className={`sound-chip ${isActive ? 'active' : ''}`}
                      onClick={() => toggleSound(sound.id)}
                    >
                      <div className="ripple-wave-effect" />
                      <div className="sound-chip-icon">
                        <sound.icon size={20} />
                      </div>
                      <span className="sound-chip-title">{sound.name}</span>
                    </div>
                  )
                })}
              </div>

              {/* Active Sound Volume Sliders List */}
              {activeSounds.length > 0 ? (
                <div className="mixer-sliders-list">
                  {activeSounds.map((soundId) => {
                    const soundItem = getMixSounds(activeDestination).find((s) => s.id === soundId)
                    if (!soundItem) return null
                    return (
                      <div key={soundId} className="mixer-slider-item">
                        <div className="slider-info">
                          <soundItem.icon size={18} style={{ color: soundItem.color }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{soundItem.name}</span>
                        </div>
                        <div className="slider-bar-wrapper">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={soundVolumes[soundId] || 50}
                            onChange={(e) => handleVolumeChange(soundId, Number(e.target.value))}
                            className="mixer-volume-slider"
                            style={{
                              background: `linear-gradient(to right, ${soundItem.color} 0%, ${soundItem.color} ${soundVolumes[soundId]}%, rgba(255,255,255,0.1) ${soundVolumes[soundId]}%, rgba(255,255,255,0.1) 100%)`
                            }}
                            aria-label={`Volume for ${soundItem.name}`}
                          />
                        </div>
                        <span style={{ fontSize: '0.85rem', width: '35px', textAlign: 'right', color: 'var(--c-text-secondary)' }}>
                          {soundVolumes[soundId]}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--c-text-secondary)' }}>
                  <WifiOff size={32} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
                  <p>All sounds are muted. Select a chip above to build a mix.</p>
                </div>
              )}
            </div>

            {/* Mixer Presets Sidebar */}
            <div className="mixer-sidebar">
              <div className="glass-card mixer-preset-card">
                <h3>Recommended Mixes</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--c-text-secondary)', marginBottom: '2rem' }}>
                  Quickly switch between pre-compiled ambient ratios curated by our team.
                </p>
                <div className="preset-pills">
                  {PRESET_MIXES.map((preset) => (
                    <button
                      key={preset.id}
                      className={`preset-pill ${activePreset === preset.id ? 'active' : ''}`}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card mixer-preset-card" style={{ background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.05) 0%, rgba(67, 56, 202, 0.05) 100%)' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--c-sunset)' }} />
                  <span>Ambient Science</span>
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--c-text-secondary)', lineHeight: '1.6' }}>
                  Zephyr utilizes brownian sound waves, calibrated frequencies, and dynamic environmental delays that mimic actual spatial sound horizons.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Explore Beautiful Places (Destination Cards) */}
        <section className="section" id="destinations">
          <div className="section-header" style={{ textAlign: 'left', maxWidth: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <span className="section-tag">Handcrafted Worlds</span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Explore beautiful places.</h2>
            </div>
            <p className="section-desc" style={{ maxWidth: '580px', margin: 0 }}>
              Travel around the world without leaving bed. Select a location to instantly import its unique meteorological soundscape.
            </p>
          </div>

          <div className="places-scroll-container">
            {DESTINATIONS.map((place, index) => (
              <div
                key={place.id}
                className="place-card"
                onClick={() => selectDestination(index)}
              >
                <img src={place.image} alt={place.title} className="place-card-image" />
                <div className="place-card-overlay">
                  <div className="place-meta">
                    <span className="place-location">{place.location}</span>
                    <span className="place-weather">
                      <Sun size={14} />
                      <span>{place.weather}</span>
                    </span>
                  </div>
                  <h3 className="place-title">{place.title}</h3>
                  <p className="place-description">{place.description}</p>
                  
                  <div className="place-sounds">
                    {place.sounds.map((snd, idx) => (
                      <span key={idx} className="place-sound-tag">
                        {snd}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Personalized Scenarios Bento Grid */}
        <section className="section" id="personalized">
          <div className="section-header">
            <span className="section-tag">Atmospheres</span>
            <h2 className="section-title">Designed for your lifestyle.</h2>
            <p className="section-desc">
              Whether you are locking down deep work focus, meditating at sunrise, or reading a novel, discover a tailored acoustic backdrop.
            </p>
          </div>

          <div className="bento-grid">
            {SCENARIOS.map((card) => (
              <div
                key={card.id}
                className={`glass-card bento-card ${card.size}`}
                onClick={() => showToast(`Calibrating profile for: ${card.title}`)}
              >
                {/* Background lighting shapes */}
                <div className={`bento-bg-shape ${card.color}`} />
                
                <div className="bento-icon-wrapper">
                  <card.icon size={22} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Create Your Own Mix (Connected lines visual) */}
        <section className="section">
          <div className="mix-section-wrapper">
            <div className="mix-content">
              <span className="section-tag">Infinite Mixes</span>
              <h2 className="section-title">Create your own atmospheric playlist.</h2>
              <p className="section-desc" style={{ marginBottom: '2rem' }}>
                Layer individual sound nodes together, save them as custom names (e.g. "My Rain Cabin Study"), and schedule automatic sleep timers.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ color: 'var(--c-lavender-bright)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--c-text-secondary)' }}>Save custom combinations with custom names</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ color: 'var(--c-lavender-bright)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--c-text-secondary)' }}>Schedule customizable fade-outs using the Sleep Timer</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ color: 'var(--c-lavender-bright)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', color: 'var(--c-text-secondary)' }}>Sync your saved playlists instantly across all devices</span>
                </li>
              </ul>
            </div>

            <div className="canvas-mix-visual">
              {/* Connected node canvas display */}
              <div className="phone-mockup-flat">
                <div className="phone-flat-circle">
                  <Volume2 size={32} style={{ color: 'var(--c-lavender-bright)' }} />
                </div>
              </div>

              {/* Node Chips floating in absolute space */}
              <div className="mix-node-chip node-1">
                <CloudRain size={16} style={{ color: '#60a5fa' }} />
                <span>Heavy Rain</span>
              </div>
              <div className="mix-node-chip node-2">
                <Flame size={16} style={{ color: '#f97316' }} />
                <span>Pine Fireplace</span>
              </div>
              <div className="mix-node-chip node-3">
                <Wind size={16} style={{ color: '#cbd5e1' }} />
                <span>Alpine Wind</span>
              </div>
              <div className="mix-node-chip node-4">
                <Music size={16} style={{ color: '#c084fc' }} />
                <span>Lofi Guitar</span>
              </div>

              {/* Connecting lines SVG canvas */}
              <svg className="mix-connecting-svg" viewBox="0 0 500 500">
                <defs>
                  <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--c-lavender-bright)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--c-sunset)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <path d="M 120 120 L 250 250" className="mixing-line" />
                <path d="M 380 90 L 250 250" className="mixing-line" />
                <path d="M 110 380 L 250 250" className="mixing-line" />
                <path d="M 380 390 L 250 250" className="mixing-line" />
              </svg>
            </div>
          </div>
        </section>

        {/* 8. Premium Experience Grid */}
        <section className="section">
          <div className="section-header">
            <span className="section-tag">Premium Care</span>
            <h2 className="section-title">A luxurious sound space.</h2>
            <p className="section-desc">
              Experience Zephyr Premium without any boundaries. Reclaim quiet spaces for relaxation and rest.
            </p>
          </div>

          <div className="premium-benefits-grid">
            <div className="glass-card premium-card">
              <WifiOff className="premium-card-icon" size={28} />
              <h3>100% Offline Mode</h3>
              <p>Download your favorite environment sound packages ahead of time and listen during plane flights or mountain hikes without Wi-Fi.</p>
            </div>

            <div className="glass-card premium-card">
              <Layers className="premium-card-icon" size={28} />
              <h3>Unlimited Sound Stacking</h3>
              <p>Stack as many high-fidelity tracks as your mind desires. No limits on rain, wind, fire, birds, waves and music layers.</p>
            </div>

            <div className="glass-card premium-card">
              <Sparkles className="premium-card-icon" size={28} />
              <h3>Lossless HD Audio</h3>
              <p>Experience uncompressed, ultra-high-definition audio streams engineered to reproduce rich low-end thunders and crisp rain drops.</p>
            </div>

            <div className="glass-card premium-card">
              <Heart className="premium-card-icon" size={28} />
              <h3>Favorites & Quick Mixes</h3>
              <p>Mark environments as favorites to access them with a single tap from your widgets or your Apple Watch.</p>
            </div>

            <div className="glass-card premium-card">
              <Clock className="premium-card-icon" size={28} />
              <h3>Sleep Timer & Alarms</h3>
              <p>Fall asleep to a rain mix that slowly fades out over 45 minutes, then wake up to forest birds singing gently at dawn.</p>
            </div>

            <div className="glass-card premium-card">
              <Shield className="premium-card-icon" size={28} />
              <h3>Ad-Free Peace</h3>
              <p>No sudden promotional interruptions, banners, or tracking. Just pure mindfulness, calm space, and serene soundscapes.</p>
            </div>
          </div>
        </section>

        {/* 9. Testimonials Section */}
        <section className="section" id="testimonials">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Reclaim your peace of mind.</h2>
            <p className="section-desc">
              Read how thousands of meditators, students, and tired parents have restructured their sleep hygiene.
            </p>
          </div>

          <div className="testimonials-wrapper">
            <div className="glass-card testimonial-card">
              <div className="stars-container">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="quote-text">
                "The dynamic audio depth is unlike anything on the app market. Adjusting the slider for wind and hearing the rustle grow is incredibly realistic."
              </p>
              <div className="author-block">
                <img src="/elena_avatar.png" alt="Elena Rodriguez" className="author-avatar" />
                <div>
                  <h4 className="author-name">Elena Rodriguez</h4>
                  <span className="author-role">Yoga & Mindfulness Coach</span>
                </div>
              </div>
            </div>

            <div className="glass-card testimonial-card">
              <div className="stars-container">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="quote-text">
                "I suffer from insomnia and this app has been a miracle. Building a lofi-acoustic guitar and fireplace combination knocks me out within 10 minutes."
              </p>
              <div className="author-block">
                <div className="author-avatar" style={{ background: 'linear-gradient(135deg, var(--c-sunset) 0%, var(--c-lavender-bright) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>JD</div>
                <div>
                  <h4 className="author-name">Julian DeVries</h4>
                  <span className="author-role">Software Architect</span>
                </div>
              </div>
            </div>

            <div className="glass-card testimonial-card">
              <div className="stars-container">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="quote-text">
                "During remote reading, the brown noise combined with soft rain drowns out the street noise perfectly. It helps me read books for hours."
              </p>
              <div className="author-block">
                <div className="author-avatar" style={{ background: 'linear-gradient(135deg, var(--c-indigo) 0%, var(--c-lavender-bright) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>SC</div>
                <div>
                  <h4 className="author-name">Sarah Chen</h4>
                  <span className="author-role">Graduate Student</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Download App (Starry night transition + QR Code) */}
        <section className="download-section" id="download">
          {/* Twinkling ambient glowing moon background */}
          <div className="nature-moon" />
          
          <div className="download-container">
            <div className="download-content">
              <span className="section-tag" style={{ color: 'var(--c-sunset)' }}>Get Zephyr</span>
              <h2 className="download-title">Your peaceful escape is one tap away.</h2>
              <p className="download-desc">
                Reclaim calm spaces, enhance focus, and drift into deep sleep. Zephyr is free to try with no registration required.
              </p>
              
              <div className="download-badge-row">
                <a href="https://apple.com" target="_blank" rel="noopener noreferrer" className="store-badge-premium">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.28,0-1.69-.78-3.15-.78s-1.92,.76-3.15,.78c-1.3,.02-2.28-1.3-3.12-2.52C4.54,16.92,3.22,11.83,4.98,8.77c.88-1.52,2.44-2.48,4.12-2.51,1.28-.02,2.5,.87,3.29,.87s1.77-.9,3.29-.75c1.62,.07,3.1,.8,4.01,2.18-3.23,1.9-2.73,6.08,.52,7.39-1.03,2.54-2.47,5.04-3.51,6.54M15.98,5.17c.66-.81,1.11-1.93,.99-3.06-1,.04-2.2,.66-2.92,1.5-.62,.72-1.16,1.86-1.02,2.97,1.11,.09,2.26-.59,2.95-1.41Z" />
                  </svg>
                  <div className="badge-text-box">
                    <span className="badge-subtitle">Download on the</span>
                    <span className="badge-title">App Store</span>
                  </div>
                </a>

                <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="store-badge-premium">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,5.27V18.73c0,.89,.72,1.61,1.61,1.61c.29,0,.58-.08,.83-.24l11.66-7.39L5.44,5.32c-.25-.16-.54-.24-.83-.24C3.72,5.08,3,5.17,3,5.27M18.15,11.23L19.46,12l-1.31,.77-1.46-.92,1.46-.85M17.1,10.61l-10.45-6.62c.28-.18,.61-.27,.95-.27c.43,0,.85,.15,1.19,.43l8.31,6.46M6.65,18.99l10.45-6.62-8.31,6.46c-.34,.28-.76,.43-1.19,.43c-.34,0-.67-.09-.95-.27Z" />
                  </svg>
                  <div className="badge-text-box">
                    <span className="badge-subtitle">Get it on</span>
                    <span className="badge-title">Google Play</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="download-right-visual">
              {/* Premium style QR Code Box */}
              <div className="qr-code-wrapper">
                <div className="qr-code-box">
                  {/* Clean SVG representations of QR Code matrix */}
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corners */}
                    <rect x="5" y="5" width="25" height="25" fill="#030205" />
                    <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                    <rect x="13" y="13" width="9" height="9" fill="#030205" />

                    <rect x="70" y="5" width="25" height="25" fill="#030205" />
                    <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                    <rect x="78" y="13" width="9" height="9" fill="#030205" />

                    <rect x="5" y="70" width="25" height="25" fill="#030205" />
                    <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                    <rect x="13" y="78" width="9" height="9" fill="#030205" />

                    {/* Small alignment tracker */}
                    <rect x="78" y="78" width="9" height="9" fill="#030205" />

                    {/* Random code matrix patterns to simulate high-fidelity QR Code */}
                    <rect x="35" y="5" width="5" height="15" fill="#030205" />
                    <rect x="45" y="10" width="10" height="5" fill="#030205" />
                    <rect x="60" y="5" width="5" height="5" fill="#030205" />
                    <rect x="35" y="25" width="15" height="5" fill="#030205" />
                    <rect x="55" y="20" width="5" height="15" fill="#030205" />

                    <rect x="5" y="35" width="15" height="5" fill="#030205" />
                    <rect x="15" y="45" width="5" height="10" fill="#030205" />
                    <rect x="25" y="35" width="5" height="25" fill="#030205" />
                    <rect x="5" y="55" width="10" height="5" fill="#030205" />

                    <rect x="35" y="40" width="20" height="10" fill="#030205" />
                    <rect x="40" y="55" width="15" height="5" fill="#030205" />
                    <rect x="35" y="65" width="5" height="15" fill="#030205" />

                    <rect x="65" y="35" width="5" height="15" fill="#030205" />
                    <rect x="75" y="35" width="15" height="5" fill="#030205" />
                    <rect x="75" y="45" width="5" height="15" fill="#030205" />
                    <rect x="85" y="55" width="10" height="5" fill="#030205" />

                    <rect x="55" y="65" width="15" height="5" fill="#030205" />
                    <rect x="60" y="75" width="5" height="15" fill="#030205" />
                    <rect x="70" y="70" width="5" height="5" fill="#030205" />
                    <rect x="45" y="80" width="10" height="10" fill="#030205" />
                  </svg>
                </div>
                <span className="qr-label">Scan to Download</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-logo-row">
            <div className="brand" style={{ padding: 0 }}>
              <span className="brand-name">Zephyr</span>
            </div>
            <span className="footer-tagline">Calm atmospheric worlds at your fingertips.</span>
          </div>

          <div className="footer-links-grid">
            <div className="footer-link-col">
              <span className="footer-link-header">Platform</span>
              <button className="footer-link-item" onClick={() => showToast('iOS App Store redirection link')}>iOS App</button>
              <button className="footer-link-item" onClick={() => showToast('Android Google Play store link')}>Android App</button>
              <button className="footer-link-item" onClick={() => showToast('Zephyr Web Audio Beta coming soon!')}>Web Player</button>
            </div>

            <div className="footer-link-col">
              <span className="footer-link-header">Privacy & Terms</span>
              <button className="footer-link-item" onClick={() => showToast('Privacy Policy (Zephyr)')}>Privacy Policy</button>
              <button className="footer-link-item" onClick={() => showToast('Terms of Service (Zephyr)')}>Terms of Service</button>
              <button className="footer-link-item" onClick={() => showToast('General Data Protection Regulation details')}>GDPR Support</button>
            </div>

            <div className="footer-link-col">
              <span className="footer-link-header">Sanctuary</span>
              <button className="footer-link-item" onClick={() => showToast('Contact support channels')}>Support</button>
              <button className="footer-link-item" onClick={() => showToast('Press materials package download')}>Press Kit</button>
              <button className="footer-link-item" onClick={() => showToast('Join our mindfulness community')}>Community</button>
            </div>
          </div>

          <div className="footer-social-col">
            <div className="social-icons-row">
              <button className="social-icon-btn" onClick={() => showToast('Twitter channel redirection')} aria-label="Twitter">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="social-icon-btn" onClick={() => showToast('Instagram channel redirection')} aria-label="Instagram">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </button>
              <button className="social-icon-btn" onClick={() => showToast('Share Zephyr with friends')} aria-label="Share">
                <Share2 size={16} />
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>Follow our updates</span>
          </div>

          <div className="footer-bottom-copy">
            © 2026 Zephyr Ambient Systems. Designed with pure mindfulness. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Toast System Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  )
}

export default App
