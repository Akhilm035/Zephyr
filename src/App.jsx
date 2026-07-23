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
  Bell,
  Activity
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
    this.pnwDripsTimeout = null;
    this.pnwFrogsTimeout = null;
    this.pnwBirdsTimeout = null;
    this.pnwFoghornTimeout = null;
    this.photographTimeout = null;
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
      // Dunes Wind: constant warm desert wind anchor (40% balance)
      const bufferSize = 4 * this.ctx.sampleRate;
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
      lowpass.frequency.value = 240;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.05; // slow drift
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 75;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      noise.connect(lowpass);
      lowpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'sand_whisper') {
      // Sand Whisper: fine grains drifting along dune ridges (15% balance)
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
      bandpass.frequency.value = 2400;
      bandpass.Q.value = 3.2;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 400;

      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      noise.connect(bandpass);
      bandpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'campfire_glow') {
      // Campfire Glow: warm organic crackles and soft low pops (10% balance)
      const playCrackles = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        const crackleOsc = this.ctx.createOscillator();
        crackleOsc.type = 'triangle';
        crackleOsc.frequency.setValueAtTime(1100 + Math.random() * 1600, now);

        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = 'highpass';
        crackleFilter.frequency.setValueAtTime(900, now);

        const cGain = this.ctx.createGain();
        cGain.gain.setValueAtTime(0, now);
        cGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        crackleOsc.connect(crackleFilter);
        crackleFilter.connect(cGain);
        cGain.connect(gainNode);

        crackleOsc.start(now);
        crackleOsc.stop(now + 0.035);

        const nextTime = 160 + Math.random() * 480;
        this.campfireGlowTimeout = setTimeout(playCrackles, nextTime);
      };

      const rumbleOsc = this.ctx.createOscillator();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.value = 52;
      const rumbleGain = this.ctx.createGain();
      rumbleGain.gain.value = 0.22;
      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(gainNode);
      rumbleOsc.start();
      sourceNodes.push(rumbleOsc);

      playCrackles();
    }
    else if (soundId === 'tent_flutter') {
      // Tent Flutter: slow rhythmic canvas fabric flutters in breeze (8% balance)
      const bufferSize = 3 * this.ctx.sampleRate;
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
      filter.frequency.setValueAtTime(90, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.3, this.ctx.currentTime);

      const flutterLFO = this.ctx.createOscillator();
      flutterLFO.frequency.value = 0.24;

      const flutterGain = this.ctx.createGain();
      flutterGain.gain.value = 0.38;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      flutterLFO.connect(flutterGain);
      flutterGain.connect(masterGain.gain);

      noise.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(gainNode);

      flutterLFO.start();
      noise.start();
      sourceNodes.push(noise, flutterLFO);
    }
    else if (soundId === 'mountain_stream') {
      // Mountain Stream: continuous flow over pebbles (40% balance)
      const bufferSize = 4 * this.ctx.sampleRate;
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
      bandpass.frequency.value = 500;
      bandpass.Q.value = 1.1;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.4;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 80;

      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      noise.connect(bandpass);
      bandpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'alpine_breeze') {
      // Alpine Breeze: gentle wind moving over open spaces (18% balance)
      const bufferSize = 3 * this.ctx.sampleRate;
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
      lowpass.frequency.value = 200;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.06;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 60;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      noise.connect(lowpass);
      lowpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'pine_rustle') {
      // Pine Rustle: soft whispering texture of pine tree branches (12% balance)
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
      bandpass.frequency.setValueAtTime(1800, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(1.0, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.3;

      const rustleGain = this.ctx.createGain();
      rustleGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(rustleGain.gain);

      noise.connect(bandpass);
      bandpass.connect(rustleGain);
      rustleGain.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'creek_pebbles') {
      // Creek Pebbles: tiny bubbling/splashing water highlights (8% balance)
      const playPebble = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const startFreq = 800 + Math.random() * 300;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.6, now + 0.08);

        const pGain = this.ctx.createGain();
        pGain.gain.setValueAtTime(0, now);
        pGain.gain.linearRampToValueAtTime(0.15, now + 0.005);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        const delayNode = this.ctx.createDelay();
        delayNode.delayTime.value = 0.12;
        const delayGain = this.ctx.createGain();
        delayGain.gain.value = 0.45;

        osc.connect(pGain);
        pGain.connect(gainNode);
        pGain.connect(delayNode);
        delayNode.connect(delayGain);
        delayGain.connect(gainNode);
        delayGain.connect(delayNode);

        osc.start(now);
        osc.stop(now + 0.1);

        const nextTime = 2000 + Math.random() * 2000;
        this.creekPebblesTimeout = setTimeout(playPebble, nextTime);
      };
      playPebble();
    }
    else if (soundId === 'distant_waterfall') {
      // Distant Waterfall: soft muffled rumble echoing through valley (7% balance)
      const bufferSize = 4 * this.ctx.sampleRate;
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
      lowpass.frequency.value = 110;

      noise.connect(lowpass);
      lowpass.connect(gainNode);

      noise.start();
      sourceNodes.push(noise);
    }
    else if (soundId === 'meadow_grass') {
      // Meadow Grass: soft organic movement of meadow grasses (5% balance)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 3200;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.25;

      const grassGain = this.ctx.createGain();
      grassGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(grassGain.gain);

      noise.connect(highpass);
      highpass.connect(grassGain);
      grassGain.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'soft_songbirds') {
      // Soft Songbirds: sparse, distant melodic whistlings (5% balance)
      const playBirds = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const chirpCount = 1 + Math.floor(Math.random() * 2);

        for (let i = 0; i < chirpCount; i++) {
          const t = now + i * 0.22;
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          const startPitch = 2200 + Math.random() * 600;
          osc.frequency.setValueAtTime(startPitch, t);
          osc.frequency.exponentialRampToValueAtTime(startPitch * 1.15, t + 0.12);

          const bGain = this.ctx.createGain();
          bGain.gain.setValueAtTime(0, t);
          bGain.gain.linearRampToValueAtTime(0.08, t + 0.01);
          bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(bGain);
          bGain.connect(gainNode);
          
          osc.start(t);
          osc.stop(t + 0.15);
        }

        const nextTime = 12000 + Math.random() * 12000;
        this.softSongbirdsTimeout = setTimeout(playBirds, nextTime);
      };
      this.softSongbirdsTimeout = setTimeout(playBirds, 4000);
    }
    else if (soundId === 'aeolian_harp') {
      // Aeolian Harp Echo: ethereal wind-generated string harmonics (5% balance)
      const harpScale = [392.00, 493.88, 587.33, 739.99, 783.99, 987.77];

      const playHarp = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const notesToPlay = [];
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          notesToPlay.push(harpScale[Math.floor(Math.random() * harpScale.length)]);
        }

        notesToPlay.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);

          const hGain = this.ctx.createGain();
          hGain.gain.setValueAtTime(0, now);
          hGain.gain.linearRampToValueAtTime(0.06, now + 2.5);
          hGain.gain.setValueAtTime(0.06, now + 3.5);
          hGain.gain.exponentialRampToValueAtTime(0.001, now + 7.5);

          const delayNode = this.ctx.createDelay();
          delayNode.delayTime.value = 0.85;
          const delayGain = this.ctx.createGain();
          delayGain.gain.value = 0.5;

          osc.connect(filter);
          filter.connect(hGain);
          
          hGain.connect(gainNode);
          hGain.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(gainNode);
          delayGain.connect(delayNode);

          osc.start(now);
          osc.stop(now + 8.0);
        });

        const nextTime = 10000 + Math.random() * 8000;
        this.aeolianHarpTimeout = setTimeout(playHarp, nextTime);
      };
      this.aeolianHarpTimeout = setTimeout(playHarp, 6000);
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
    else if (soundId === 'ney_echo') {
      // Ney Flute Echo: breathy, airy notes of a distant ney flute with long, airy reverb (5% balance)
      const neyScale = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
      let noteIndex = 0;

      const playNey = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const freq = neyScale[noteIndex];
        osc.frequency.setValueAtTime(freq, now);

        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 0.12;
        }
        const breath = this.ctx.createBufferSource();
        breath.buffer = noiseBuffer;
        
        const bpFilter = this.ctx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.setValueAtTime(freq * 1.5, now);
        bpFilter.Q.setValueAtTime(3.0, now);

        const vibrato = this.ctx.createOscillator();
        vibrato.frequency.value = 5.0;
        const vibGain = this.ctx.createGain();
        vibGain.gain.value = 2.0;
        vibrato.connect(vibGain);
        vibGain.connect(osc.frequency);

        const neyGain = this.ctx.createGain();
        neyGain.gain.setValueAtTime(0, now);
        neyGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
        neyGain.gain.setValueAtTime(0.18, now + 4.0);
        neyGain.gain.exponentialRampToValueAtTime(0.001, now + 5.8);

        const delayNode = this.ctx.createDelay();
        delayNode.delayTime.value = 0.65;
        const delayFeedback = this.ctx.createGain();
        delayFeedback.gain.value = 0.55;

        osc.connect(neyGain);
        breath.connect(bpFilter);
        bpFilter.connect(neyGain);

        neyGain.connect(gainNode);
        neyGain.connect(delayNode);
        delayNode.connect(delayFeedback);
        delayFeedback.connect(gainNode);
        delayFeedback.connect(delayNode);

        osc.start(now);
        breath.start(now);
        vibrato.start(now);

        osc.stop(now + 6.0);
        breath.stop(now + 6.0);
        vibrato.stop(now + 6.0);

        noteIndex = (noteIndex + 1) % neyScale.length;

        const nextTime = 9000 + Math.random() * 6000;
        this.neyEchoTimeout = setTimeout(playNey, nextTime);
      };
      this.neyEchoTimeout = setTimeout(playNey, 3000);
    }
    else if (soundId === 'desert_insects') {
      // Desert Night Insects: sparse subtle high frequency cricket/insect pulse (7% balance)
      const playInsects = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const duration = 0.4 + Math.random() * 0.4;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3950 + Math.random() * 150, now);

        const tremolo = this.ctx.createOscillator();
        tremolo.frequency.value = 8.5;
        const tremGain = this.ctx.createGain();
        tremGain.gain.value = 0.45;
        
        tremolo.connect(tremGain);
        tremGain.connect(osc.frequency);

        const iGain = this.ctx.createGain();
        iGain.gain.setValueAtTime(0, now);
        iGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        iGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(iGain);
        iGain.connect(gainNode);

        tremolo.start(now);
        osc.start(now);
        tremolo.stop(now + duration + 0.05);
        osc.stop(now + duration + 0.05);

        const nextTime = 1200 + Math.random() * 2000;
        this.desertInsectsTimeout = setTimeout(playInsects, nextTime);
      };
      playInsects();
    }
    else if (soundId === 'oasis_ripples') {
      // Oasis Water Ripples: slow, gentle water wavelets in oasis (12% balance)
      const playRipple = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140 + Math.random() * 30, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);

        const rGain = this.ctx.createGain();
        rGain.gain.setValueAtTime(0, now);
        rGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(filter);
        filter.connect(rGain);
        rGain.connect(gainNode);

        osc.start(now);
        osc.stop(now + 3.95);

        const nextTime = 4000 + Math.random() * 4000;
        this.oasisRipplesTimeout = setTimeout(playRipple, nextTime);
      };
      playRipple();
    }
    else if (soundId === 'camel_bells') {
      // Camel Bells: very rare, soft resonating distant bells (3% balance)
      const playBells = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const baseFreq = 950 + Math.random() * 250;

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

        const osc3 = this.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(baseFreq * 2.1, now);

        const bGain = this.ctx.createGain();
        bGain.gain.setValueAtTime(0, now);
        bGain.gain.linearRampToValueAtTime(0.08, now + 0.005);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc1.connect(bGain);
        osc2.connect(bGain);
        osc3.connect(bGain);
        bGain.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        
        osc1.stop(now + 2.6);
        osc2.stop(now + 2.6);
        osc3.stop(now + 2.6);

        const nextTime = 20000 + Math.random() * 15000;
        this.camelBellsTimeout = setTimeout(playBells, nextTime);
      };
      this.camelBellsTimeout = setTimeout(playBells, 10000);
    }
    else if (soundId === 'rainforest_stream') {
      // Warm continuous tropical stream anchor (40% importance)
      const bufferSize = 4 * this.ctx.sampleRate;
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
      lowpass.frequency.value = 550;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.35;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 120;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      noise.connect(lowpass);
      lowpass.connect(gainNode);
      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'toucan') {
      // Toucan: periodic warm, rhythmic wooden croaks / clacks ("kurr-uk")
      const playToucan = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const croakCount = 3 + Math.floor(Math.random() * 3); // 3-5 croaks
        const basePitch = 480 + Math.random() * 60; // warm woody range

        for (let i = 0; i < croakCount; i++) {
          const t = now + i * 0.18; // space between croaks
          
          // Triangle carrier oscillator
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(basePitch, t);
          osc.frequency.exponentialRampToValueAtTime(basePitch * 0.7, t + 0.12);

          // Sub frequency FM oscillator to give it a croaking rattle rasp
          const fmOsc = this.ctx.createOscillator();
          fmOsc.type = 'sawtooth';
          fmOsc.frequency.setValueAtTime(65, t);
          const fmGain = this.ctx.createGain();
          fmGain.gain.setValueAtTime(80, t);

          fmOsc.connect(fmGain);
          fmGain.connect(osc.frequency);

          // Bandpass filter for hollow beak resonance
          const bpFilter = this.ctx.createBiquadFilter();
          bpFilter.type = 'bandpass';
          bpFilter.frequency.setValueAtTime(750, t);
          bpFilter.Q.setValueAtTime(3.5, t);

          // Envelope
          const croakGain = this.ctx.createGain();
          croakGain.gain.setValueAtTime(0, t);
          croakGain.gain.linearRampToValueAtTime(0.3, t + 0.01);
          croakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

          osc.connect(bpFilter);
          bpFilter.connect(croakGain);
          croakGain.connect(gainNode);

          osc.start(t);
          fmOsc.start(t);
          osc.stop(t + 0.15);
          fmOsc.stop(t + 0.15);
        }

        // Schedule next call in 7 to 15 seconds
        const nextTime = 7000 + Math.random() * 8000;
        this.toucanTimeout = setTimeout(playToucan, nextTime);
      };
      // Initial delay of 5 seconds
      this.toucanTimeout = setTimeout(playToucan, 5000);
    }
    else if (soundId === 'glass_frogs') {
      // Gentle rhythmic glass frog chorus ambience (10% importance)
      const playGlassFrogs = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const count = 1 + Math.floor(Math.random() * 2);
        const pitch = 1100 + Math.random() * 200;

        for (let i = 0; i < count; i++) {
          const t = now + i * 0.2;
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, t);
          osc.frequency.exponentialRampToValueAtTime(pitch + 120, t + 0.08);

          const frogGain = this.ctx.createGain();
          frogGain.gain.setValueAtTime(0, t);
          frogGain.gain.linearRampToValueAtTime(0.08, t + 0.01);
          frogGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          osc.connect(frogGain);
          frogGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.15);
        }

        const nextTime = 2000 + Math.random() * 3500;
        this.glassFrogsTimeout = setTimeout(playGlassFrogs, nextTime);
      };
      playGlassFrogs();
    }
    else if (soundId === 'canopy_breeze') {
      // Light wind moving through leaves (5% importance - slow, never stormy)
      const bufferSize = 3 * this.ctx.sampleRate;
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
      lfo.frequency.value = 0.06; // ultra slow 0.06Hz breeze
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
    else if (soundId === 'creek_splashes') {
      // Rare small splashes from water interacting with rocks (3% importance)
      const playSplash = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        
        const bufferSize = 0.1 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200 + Math.random() * 600;
        filter.Q.value = 2.0;

        const sGain = this.ctx.createGain();
        sGain.gain.setValueAtTime(0, now);
        sGain.gain.linearRampToValueAtTime(0.06, now + 0.005);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        noise.connect(filter);
        filter.connect(sGain);
        sGain.connect(gainNode);
        noise.start(now);

        const nextTime = 3000 + Math.random() * 7000;
        this.creekSplashesTimeout = setTimeout(playSplash, nextTime);
      };
      playSplash();
    }
    else if (soundId === 'howler_monkey' || soundId === 'howler_calls') {
      // Distant Howler Monkey (2% importance - rare occurrence every few minutes, subtle)
      const playHowler = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.8);
        osc.frequency.linearRampToValueAtTime(130, now + 1.6);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350; // distant muted sound

        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(0, now);
        hGain.gain.linearRampToValueAtTime(0.04, now + 0.3); // subtle max gain 0.04
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

        osc.connect(filter);
        filter.connect(hGain);
        hGain.connect(gainNode);

        osc.start(now);
        osc.stop(now + 1.75);

        // Schedule next howler call in 2 to 4 minutes (120,000ms - 240,000ms)
        const nextTime = 120000 + Math.random() * 120000;
        this.howlerTimeout = setTimeout(playHowler, nextTime);
      };
      // Initial trigger after 40 seconds
      this.howlerTimeout = setTimeout(playHowler, 40000 + Math.random() * 30000);
    }
    else if (soundId === 'longing_aurdos') {
      // "Longing by Aurdos" - Warm emotional ambient house/lo-fi track
      const tempo = 0.625; // 96 BPM (0.625s per beat)
      let step = 0;

      // Chord Progression definition (FM7 -> Am7 -> BbM7 -> C7)
      const progressions = [
        [174.61, 220.00, 261.63, 329.63], // FM7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [233.08, 293.66, 349.23, 440.00], // BbM7
        [130.81, 196.00, 329.63, 466.16]  // C7
      ];
      let currentChordIdx = 0;

      const playLoop = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        // 1. Soft Warm Kick (On beats 0 and 2)
        if (step % 2 === 0) {
          const kickOsc = this.ctx.createOscillator();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(100, now);
          kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

          const kickGain = this.ctx.createGain();
          kickGain.gain.setValueAtTime(0, now);
          kickGain.gain.linearRampToValueAtTime(0.35, now + 0.005);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          kickOsc.connect(kickGain);
          kickGain.connect(gainNode);
          kickOsc.start(now);
          kickOsc.stop(now + 0.18);
        }

        // 2. Plucked Muted Electric Guitar (Plays emotional melody on half beats)
        if (step % 4 === 1 || step % 4 === 3 || (step % 8 === 0 && Math.random() > 0.5)) {
          const chord = progressions[currentChordIdx];
          const baseFreq = chord[Math.floor(Math.random() * chord.length)] * 2.0;

          const pluckOsc = this.ctx.createOscillator();
          pluckOsc.type = 'triangle';
          pluckOsc.frequency.setValueAtTime(baseFreq, now);

          const subOsc = this.ctx.createOscillator();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);

          const pluckFilter = this.ctx.createBiquadFilter();
          pluckFilter.type = 'lowpass';
          pluckFilter.frequency.setValueAtTime(1100, now);

          const pluckGain = this.ctx.createGain();
          pluckGain.gain.setValueAtTime(0, now);
          pluckGain.gain.linearRampToValueAtTime(0.24, now + 0.008);
          pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          const delayNode = this.ctx.createDelay();
          delayNode.delayTime.value = tempo * 0.75;
          const delayGain = this.ctx.createGain();
          delayGain.gain.value = 0.4;

          pluckOsc.connect(pluckFilter);
          subOsc.connect(pluckFilter);
          pluckFilter.connect(pluckGain);
          
          pluckGain.connect(gainNode);
          pluckGain.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(gainNode);
          delayGain.connect(delayNode); // feedback loop

          pluckOsc.start(now);
          subOsc.start(now);
          pluckOsc.stop(now + 0.95);
          subOsc.stop(now + 0.95);
        }

        // 3. Slow Ambient Synth Pad (Triggers chord pads every 8 beats)
        if (step % 8 === 0) {
          currentChordIdx = (currentChordIdx + 1) % progressions.length;
          const chord = progressions[currentChordIdx];

          chord.forEach((freq) => {
            const padOsc = this.ctx.createOscillator();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(freq, now);

            const padFilter = this.ctx.createBiquadFilter();
            padFilter.type = 'lowpass';
            padFilter.frequency.setValueAtTime(450, now);

            const padGain = this.ctx.createGain();
            padGain.gain.setValueAtTime(0, now);
            padGain.gain.linearRampToValueAtTime(0.08, now + 1.8);
            padGain.gain.setValueAtTime(0.08, now + 3.5);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

            padOsc.connect(padFilter);
            padFilter.connect(padGain);
            padGain.connect(gainNode);

            padOsc.start(now);
            padOsc.stop(now + 4.95);
          });
        }

        step = (step + 1) % 16;
        this.longingAurdosTimeout = setTimeout(playLoop, tempo * 1000);
      };
      playLoop();
    }
    else if (soundId === 'leben_dieter_huber') {
      // "Leben by Dieter Huber" - Minimalist, reflective ambient sound
      const tempo = 0.833; // 72 BPM
      let step = 0;

      // Chord progression: Em7 -> Cmaj7 -> Gmaj7 -> D6
      const progressions = [
        [164.81, 196.00, 246.94, 293.66], // Em7
        [130.81, 196.00, 261.63, 329.63], // Cmaj7
        [196.00, 246.94, 293.66, 369.99], // Gmaj7
        [146.83, 220.00, 293.66, 369.99]  // D6
      ];
      let currentChordIdx = 0;

      const playLoop = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        // 1. Slow swelling warm ambient synthesizer pad (every 8 beats)
        if (step % 8 === 0) {
          currentChordIdx = (currentChordIdx + 1) % progressions.length;
          const chord = progressions[currentChordIdx];

          chord.forEach((freq) => {
            const padOsc = this.ctx.createOscillator();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(freq, now);

            const padFilter = this.ctx.createBiquadFilter();
            padFilter.type = 'lowpass';
            padFilter.frequency.setValueAtTime(380, now);

            const padGain = this.ctx.createGain();
            padGain.gain.setValueAtTime(0, now);
            padGain.gain.linearRampToValueAtTime(0.08, now + 2.2); // slow attack
            padGain.gain.setValueAtTime(0.08, now + 4.5);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + 6.5); // long release

            padOsc.connect(padFilter);
            padFilter.connect(padGain);
            padGain.connect(gainNode);

            padOsc.start(now);
            padOsc.stop(now + 6.6);
          });
        }

        // 2. Reflective, echoing chime/glass melody (randomly on beat subdivisions)
        if (step % 4 === 2 || (step % 8 === 5 && Math.random() > 0.4)) {
          const melodyScale = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25];
          const chimeFreq = melodyScale[Math.floor(Math.random() * melodyScale.length)];

          const chimeOsc = this.ctx.createOscillator();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(chimeFreq, now);

          const chimeGain = this.ctx.createGain();
          chimeGain.gain.setValueAtTime(0, now);
          chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.01);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

          const delayNode = this.ctx.createDelay();
          delayNode.delayTime.value = tempo * 1.5;
          const delayGain = this.ctx.createGain();
          delayGain.gain.value = 0.5;

          chimeOsc.connect(chimeGain);
          chimeGain.connect(gainNode);
          chimeGain.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(gainNode);
          delayGain.connect(delayNode); // delay feedback loop

          chimeOsc.start(now);
          chimeOsc.stop(now + 2.6);
        }

        step = (step + 1) % 16;
        this.lebenDieterHuberTimeout = setTimeout(playLoop, tempo * 1000);
      };
      playLoop();
    }
    else if (soundId === 'windstorm_erik_reno') {
      // "Windstorm by Erik Reno" - Ethereal ambient guitar swells and low-pass wind movement
      const tempo = 1.0; // 60 BPM
      let step = 0;

      const progressions = [
        [220.00, 261.63, 329.63, 440.00], // Am
        [174.61, 220.00, 261.63, 349.23], // F
        [130.81, 196.00, 261.63, 329.63], // C
        [196.00, 246.94, 293.66, 392.00]  // G
      ];
      let currentChordIdx = 0;

      const playLoop = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        // 1. Slow swelling ambient guitar pad / chords (every 8 beats)
        if (step % 8 === 0) {
          currentChordIdx = (currentChordIdx + 1) % progressions.length;
          const chord = progressions[currentChordIdx];

          chord.forEach((freq) => {
            const guitarOsc = this.ctx.createOscillator();
            guitarOsc.type = 'triangle';
            guitarOsc.frequency.setValueAtTime(freq, now);

            const guitarFilter = this.ctx.createBiquadFilter();
            guitarFilter.type = 'lowpass';
            guitarFilter.frequency.setValueAtTime(200, now);
            guitarFilter.frequency.exponentialRampToValueAtTime(700, now + 3.0);

            const guitarGain = this.ctx.createGain();
            guitarGain.gain.setValueAtTime(0, now);
            guitarGain.gain.linearRampToValueAtTime(0.08, now + 3.0);
            guitarGain.gain.setValueAtTime(0.08, now + 4.5);
            guitarGain.gain.exponentialRampToValueAtTime(0.001, now + 7.5);

            guitarOsc.connect(guitarFilter);
            guitarFilter.connect(guitarGain);
            guitarGain.connect(gainNode);

            guitarOsc.start(now);
            guitarOsc.stop(now + 7.8);
          });
        }

        // 2. Introspective, echoing guitar pluck melodies (randomly on subdivisions)
        if (step % 4 === 1 || (step % 8 === 6 && Math.random() > 0.4)) {
          const melodyScale = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
          const pluckFreq = melodyScale[Math.floor(Math.random() * melodyScale.length)];

          const pluckOsc = this.ctx.createOscillator();
          pluckOsc.type = 'sine';
          pluckOsc.frequency.setValueAtTime(pluckFreq, now);

          const pluckGain = this.ctx.createGain();
          pluckGain.gain.setValueAtTime(0, now);
          pluckGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
          pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

          const delayNode = this.ctx.createDelay();
          delayNode.delayTime.value = 0.6;
          const delayGain = this.ctx.createGain();
          delayGain.gain.value = 0.55;

          pluckOsc.connect(pluckGain);
          pluckGain.connect(gainNode);
          pluckGain.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(gainNode);
          delayGain.connect(delayNode); // feedback loop

          pluckOsc.start(now);
          pluckOsc.stop(now + 3.2);
        }

        step = (step + 1) % 16;
        this.windstormErikRenoTimeout = setTimeout(playLoop, tempo * 1000);
      };
      playLoop();
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
    else if (soundId === 'pnw_rain') {
      // Forest Rain: filtered white noise mimicking soft evergreen rain
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 1100;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1800;
      bandpass.Q.value = 1.0;

      whiteNoise.connect(lowpass);
      lowpass.connect(bandpass);
      bandpass.connect(gainNode);
      whiteNoise.start();
      sourceNodes.push(whiteNoise);
    }
    else if (soundId === 'pnw_creek') {
      // Creek Flow: organic water trickling (swept bandpass filtered noise)
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
      bandpass.frequency.value = 650;
      bandpass.Q.value = 2.5;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.25; // water ripple rate
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 250;

      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      noise.connect(bandpass);
      bandpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'pnw_drips') {
      // Cedar Drips: random large water drops falling from canopy
      const playDrips = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const pitch = 220 + Math.random() * 180;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 2.5, now + 0.08);

        const dGain = this.ctx.createGain();
        dGain.gain.setValueAtTime(0, now);
        dGain.gain.linearRampToValueAtTime(0.2, now + 0.005);
        dGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(dGain);
        dGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.1);

        const nextTime = 1500 + Math.random() * 3500;
        this.pnwDripsTimeout = setTimeout(playDrips, nextTime);
      };
      playDrips();
    }
    else if (soundId === 'pnw_breeze') {
      // Coastal Breeze: wind moving through cedar canopy
      const bufferSize = 3 * this.ctx.sampleRate;
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
      lowpass.frequency.value = 250;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.04; // slow coastal wind cycle
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 80;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      noise.connect(lowpass);
      lowpass.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'pnw_swell') {
      // Ocean Swell: deep, distant waves rolling in
      const bufferSize = 4 * this.ctx.sampleRate;
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
      lowpass.frequency.value = 80; // deep bass rumble

      const swellLFO = this.ctx.createOscillator();
      swellLFO.frequency.value = 0.12; // slow 8-second swell cycle
      const swellGain = this.ctx.createGain();
      swellGain.gain.value = 45;

      swellLFO.connect(swellGain);
      swellGain.connect(lowpass.frequency);

      const ampLFO = this.ctx.createOscillator();
      ampLFO.frequency.value = 0.12;
      const ampGain = this.ctx.createGain();
      ampGain.gain.value = 0.45;
      
      const masterSwellGain = this.ctx.createGain();
      masterSwellGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      
      ampLFO.connect(ampGain);
      ampGain.connect(masterSwellGain.gain);

      noise.connect(lowpass);
      lowpass.connect(masterSwellGain);
      masterSwellGain.connect(gainNode);

      swellLFO.start();
      ampLFO.start();
      noise.start();
      sourceNodes.push(noise, swellLFO, ampLFO);
    }
    else if (soundId === 'pnw_frogs') {
      // Tree Frogs: soft chorusing winks
      const playFrogs = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const chirpCount = 4 + Math.floor(Math.random() * 3);
        const baseFreq = 1600 + Math.random() * 200;

        for (let i = 0; i < chirpCount; i++) {
          const t = now + i * 0.15;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(baseFreq, t);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t + 0.08);

          const fGain = this.ctx.createGain();
          fGain.gain.setValueAtTime(0, t);
          fGain.gain.linearRampToValueAtTime(0.12, t + 0.005);
          fGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          osc.connect(fGain);
          fGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.1);
        }

        const nextTime = 4000 + Math.random() * 5000;
        this.pnwFrogsTimeout = setTimeout(playFrogs, nextTime);
      };
      playFrogs();
    }
    else if (soundId === 'pnw_birds') {
      // Songbirds: infrequent thrushes & wrens
      const playBirds = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const noteCount = 3 + Math.floor(Math.random() * 4);
        const basePitch = 2200 + Math.random() * 1200;

        for (let i = 0; i < noteCount; i++) {
          const t = now + i * 0.25;
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(basePitch, t);
          osc.frequency.exponentialRampToValueAtTime(basePitch * (1.1 - Math.random() * 0.3), t + 0.18);

          const bGain = this.ctx.createGain();
          bGain.gain.setValueAtTime(0, t);
          bGain.gain.linearRampToValueAtTime(0.04, t + 0.01);
          bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

          osc.connect(bGain);
          bGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.22);
        }

        const nextTime = 18000 + Math.random() * 15000;
        this.pnwBirdsTimeout = setTimeout(playBirds, nextTime);
      };
      this.pnwBirdsTimeout = setTimeout(playBirds, 6000 + Math.random() * 6000);
    }
    else if (soundId === 'pnw_foghorn') {
      // Fog Horn Echo: very rare, low-frequency atmospheric coast warning
      const playFoghorn = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        // Dual sine oscillators at 92Hz & 138Hz to create a natural hollow fifth chord
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(92, now);
        osc2.frequency.setValueAtTime(138, now);

        const hornFilter = this.ctx.createBiquadFilter();
        hornFilter.type = 'lowpass';
        hornFilter.frequency.setValueAtTime(220, now);

        const envelope = this.ctx.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.25, now + 0.6); // slow swelling attack
        envelope.gain.setValueAtTime(0.25, now + 2.2);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 3.8); // long decaying echo

        osc1.connect(hornFilter);
        osc2.connect(hornFilter);
        hornFilter.connect(envelope);
        envelope.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 4.0);
        osc2.stop(now + 4.0);

        const nextTime = 35000 + Math.random() * 25000;
        this.pnwFoghornTimeout = setTimeout(playFoghorn, nextTime);
      };
      this.pnwFoghornTimeout = setTimeout(playFoghorn, 12000 + Math.random() * 12000);
    }
    else if (soundId === 'photograph_noham_st_pierre') {
      // Photograph by Noham St Pierre: nostalgic, slow cinematic ambient piano track
      const playLoop = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        // Melancholic 4-chord progression (slow tempo: 8.5 seconds per chord change)
        const chords = [
          [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9 (C3, G3, B3, D4, E4)
          [110.00, 164.81, 220.00, 261.63, 311.13], // Am9 (A2, E3, A3, C4, D#4/E4)
          [87.31,  174.61, 218.27, 261.63, 349.23], // Fmaj9 (F2, F3, A3, C4, F4)
          [98.00,  146.83, 196.00, 246.94, 392.00]  // G13 (G2, D3, G3, B3, G4)
        ];

        const chordIndex = Math.floor(now / 8.5) % chords.length;
        const activeChord = chords[chordIndex];

        // Play each note in the chord with a slight stagger/arpeggio delay to simulate organic touch
        activeChord.forEach((freq, idx) => {
          const noteTime = now + idx * 0.18; // soft arpeggiation

          // Dual sine carrier for soft piano feel
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          const lowpass = this.ctx.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.setValueAtTime(450, noteTime); // warm, muted piano profile

          const pluckGain = this.ctx.createGain();
          pluckGain.gain.setValueAtTime(0, noteTime);
          pluckGain.gain.linearRampToValueAtTime(0.24, noteTime + 0.08); // slow soft attack
          pluckGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 5.2); // long sustain decay

          // Delay effect line
          const delayNode = this.ctx.createDelay(8.0);
          delayNode.delayTime.setValueAtTime(1.8, noteTime); // spacious echo
          const delayGain = this.ctx.createGain();
          delayGain.gain.setValueAtTime(0.28, noteTime); // feedback gain

          osc.connect(lowpass);
          lowpass.connect(pluckGain);
          pluckGain.connect(gainNode);

          // Connect to feedback delay loop
          pluckGain.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(gainNode);
          delayGain.connect(delayNode); // feedback

          osc.start(noteTime);
          osc.stop(noteTime + 6.0);
        });

        // Slow pulse rate
        this.photographTimeout = setTimeout(playLoop, 8500);
      };
      playLoop();
    }
    else if (soundId === 'ocean_swell') {
      // Extremely low, powerful Pacific swell waves
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
      filter.frequency.value = 160;

      // 0.05 Hz swell sweep (20 seconds cycle)
      const swellLFO = this.ctx.createOscillator();
      swellLFO.frequency.value = 0.05;
      
      const swellGain = this.ctx.createGain();
      swellGain.gain.value = 90;

      swellLFO.connect(swellGain);
      swellGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);
      
      swellLFO.start();
      noise.start();
      sourceNodes.push(noise, swellLFO);
    }
    else if (soundId === 'gentle_reef') {
      // Soft wave wash over volcanic rocks/reefs (slightly brighter lowpass noise sweep)
      const bufferSize = 3 * this.ctx.sampleRate;
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
      filter.frequency.value = 350;

      // 0.12 Hz LFO cycle
      const washLFO = this.ctx.createOscillator();
      washLFO.frequency.value = 0.12;
      
      const washGain = this.ctx.createGain();
      washGain.gain.value = 140;

      washLFO.connect(washGain);
      washGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);
      
      washLFO.start();
      noise.start();
      sourceNodes.push(noise, washLFO);
    }
    else if (soundId === 'trade_wind') {
      // Warm, steady breeze sweep across the coast
      const bufferSize = 2.5 * this.ctx.sampleRate;
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
      filter.frequency.value = 300;

      // LFO for gentle gusts
      const breezeLFO = this.ctx.createOscillator();
      breezeLFO.frequency.value = 0.08;
      
      const breezeGain = this.ctx.createGain();
      breezeGain.gain.value = 110;

      breezeLFO.connect(breezeGain);
      breezeGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);
      
      breezeLFO.start();
      noise.start();
      sourceNodes.push(noise, breezeLFO);
    }
    else if (soundId === 'palm_rustle') {
      // Periodic rustling sound of palm leaves
      const playRustle = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        
        // High frequency noise burst
        const bufferSize = 1.2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.value = 2.0;

        // Modulate with small fast fluctuations
        const mod = this.ctx.createOscillator();
        mod.frequency.value = 8; // 8Hz flutter
        const modGain = this.ctx.createGain();
        modGain.gain.value = 300;
        mod.connect(modGain);
        modGain.connect(filter.frequency);

        const rGain = this.ctx.createGain();
        rGain.gain.setValueAtTime(0, now);
        rGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
        rGain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

        noise.connect(filter);
        filter.connect(rGain);
        rGain.connect(gainNode);

        mod.start(now);
        noise.start(now);
        mod.stop(now + 1.2);
        noise.stop(now + 1.2);

        const nextTime = 4000 + Math.random() * 6000;
        this.palmRustleTimeout = setTimeout(playRustle, nextTime);
      };
      playRustle();
    }
    else if (soundId === 'lagoon_ripples') {
      // Rhythmic gentle splash/ripple sound (small high pitch drops)
      const playRipples = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const count = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < count; i++) {
          const t = now + i * 0.16;
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          
          const pitch = 700 + Math.random() * 300;
          osc.frequency.setValueAtTime(pitch, t);
          osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, t + 0.12);

          const wGain = this.ctx.createGain();
          wGain.gain.setValueAtTime(0, t);
          wGain.gain.linearRampToValueAtTime(0.08, t + 0.005);
          wGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(wGain);
          wGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.16);
        }

        const nextTime = 2500 + Math.random() * 3500;
        this.lagoonRipplesTimeout = setTimeout(playRipples, nextTime);
      };
      playRipples();
    }
    else if (soundId === 'night_crickets') {
      // Constant high frequency chirpy cricket pulses
      const playCrickets = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const pulseCount = 3 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < pulseCount; i++) {
          const t = now + i * 0.07;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(3900 + Math.random() * 100, t);

          const cGain = this.ctx.createGain();
          cGain.gain.setValueAtTime(0, t);
          cGain.gain.linearRampToValueAtTime(0.03, t + 0.002);
          cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

          osc.connect(cGain);
          cGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.06);
        }

        const nextTime = 1200 + Math.random() * 800;
        this.nightCricketsTimeout = setTimeout(playCrickets, nextTime);
      };
      playCrickets();
    }
    else if (soundId === 'poly_frogs') {
      // Polynesian tropical tree frog chorusing
      const playFrogs = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const chirpCount = 3 + Math.floor(Math.random() * 3);
        const pitch = 1450 + Math.random() * 150;

        for (let i = 0; i < chirpCount; i++) {
          const t = now + i * 0.18;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(pitch, t);
          osc.frequency.exponentialRampToValueAtTime(pitch * 0.82, t + 0.09);

          const fGain = this.ctx.createGain();
          fGain.gain.setValueAtTime(0, t);
          fGain.gain.linearRampToValueAtTime(0.1, t + 0.005);
          fGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          osc.connect(fGain);
          fGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.12);
        }

        const nextTime = 5000 + Math.random() * 6000;
        this.polyFrogsTimeout = setTimeout(playFrogs, nextTime);
      };
      playFrogs();
    }
    else if (soundId === 'distant_seabirds') {
      // Occasional gliding bird cry
      const playSeabirds = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const startPitch = 1900 + Math.random() * 300;
        osc.frequency.setValueAtTime(startPitch, now);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 1.25, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 0.75, now + 0.85);

        const bGain = this.ctx.createGain();
        bGain.gain.setValueAtTime(0, now);
        bGain.gain.linearRampToValueAtTime(0.035, now + 0.15);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(bGain);
        bGain.connect(gainNode);
        
        osc.start(now);
        osc.stop(now + 1.25);

        const nextTime = 15000 + Math.random() * 15000;
        this.distantSeabirdsTimeout = setTimeout(playSeabirds, nextTime);
      };
      playSeabirds();
    }
    else if (soundId === 'relaxing_ambience_soothing_sounds') {
      // Relaxing Ambience Soothing Sounds: slow, lush major 7th and 9th chords wash
      const playMelody = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        
        // Ethereal chord loop (Gmaj9 -> Cadd9 -> Bm7 -> Am9)
        const chords = [
          [98.00,  146.83, 196.00, 246.94, 293.66, 392.00], // Gmaj9
          [130.81, 164.81, 196.00, 261.63, 329.63, 523.25], // Cadd9
          [123.47, 146.83, 196.00, 246.94, 293.66, 493.88], // Bm7
          [110.00, 130.81, 196.00, 220.00, 329.63, 440.00]  // Am9
        ];

        const chordIdx = Math.floor(now / 9.0) % chords.length;
        const activeChord = chords[chordIdx];

        activeChord.forEach((freq, idx) => {
          const t = now + idx * 0.25; // soft staggered entry

          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, t); // warm, rounded filter sweeps

          const padGain = this.ctx.createGain();
          padGain.gain.setValueAtTime(0, t);
          padGain.gain.linearRampToValueAtTime(0.18, t + 1.2); // slow, soothing fade in
          padGain.gain.exponentialRampToValueAtTime(0.001, t + 6.8); // slow, soothing decay

          // Spacious stereo delay lines
          const delayNode = this.ctx.createDelay(6.0);
          delayNode.delayTime.setValueAtTime(2.2, t);
          const delayGain = this.ctx.createGain();
          delayGain.gain.setValueAtTime(0.32, t);

          osc.connect(filter);
          filter.connect(padGain);
          padGain.connect(gainNode);

          padGain.connect(delayNode);
          delayNode.connect(delayGain);
          delayGain.connect(gainNode);
          delayGain.connect(delayNode); // feedback loop

          osc.start(t);
          osc.stop(t + 7.5);
        });

        this.relaxingAmbienceTimeout = setTimeout(playMelody, 9000);
      };
      playMelody();
    }
    else if (soundId === 'garden_stream') {
      // Constant garden stream flow over smooth rocks
      const bufferSize = 2.8 * this.ctx.sampleRate;
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
      filter.frequency.value = 280;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.22; // 0.22 Hz ripples
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 65;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'bamboo_rustle') {
      // Gentle wind whispering through tall bamboo stalks
      const bufferSize = 3 * this.ctx.sampleRate;
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
      filter.frequency.value = 950;
      filter.Q.value = 1.8;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.06; // extremely slow breeze
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 220;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'tsukubai_drips') {
      // Slow, irregular droplets falling into a traditional stone water basin
      const playDrips = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const pitch = 720 + Math.random() * 80;
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.15);

        const dGain = this.ctx.createGain();
        dGain.gain.setValueAtTime(0, now);
        dGain.gain.linearRampToValueAtTime(0.12, now + 0.005);
        dGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(dGain);
        dGain.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.2);

        // Irregular interval: 2.2 to 5.4 seconds
        const nextTime = 2200 + Math.random() * 3200;
        this.tsukubaiTimeout = setTimeout(playDrips, nextTime);
      };
      playDrips();
    }
    else if (soundId === 'maple_rustle') {
      // Gentle movement of maple and pine trees in a cool night breeze
      const bufferSize = 2.2 * this.ctx.sampleRate;
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
      filter.Q.value = 1.0;

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.18; 
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 350;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);

      lfo.start();
      noise.start();
      sourceNodes.push(noise, lfo);
    }
    else if (soundId === 'zen_crickets') {
      // Subtle Japanese insect chorus forming the ambient foundation
      const playCrickets = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const count = 4 + Math.floor(Math.random() * 2);

        for (let i = 0; i < count; i++) {
          const t = now + i * 0.06;
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4200 + Math.random() * 80, t);

          const cGain = this.ctx.createGain();
          cGain.gain.setValueAtTime(0, t);
          cGain.gain.linearRampToValueAtTime(0.02, t + 0.002);
          cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

          osc.connect(cGain);
          cGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.05);
        }

        const nextTime = 1400 + Math.random() * 900;
        this.zenCricketsTimeout = setTimeout(playCrickets, nextTime);
      };
      playCrickets();
    }
    else if (soundId === 'zen_frogs') {
      // Sparse frog calls from a distant pond, placed deep in the stereo field
      const playFrogs = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        const count = 2 + Math.floor(Math.random() * 3);
        const pitch = 1350 + Math.random() * 120;

        for (let i = 0; i < count; i++) {
          const t = now + i * 0.22;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(pitch, t);
          osc.frequency.exponentialRampToValueAtTime(pitch * 0.88, t + 0.08);

          const fGain = this.ctx.createGain();
          fGain.gain.setValueAtTime(0, t);
          fGain.gain.linearRampToValueAtTime(0.06, t + 0.005);
          fGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

          osc.connect(fGain);
          fGain.connect(gainNode);
          osc.start(t);
          osc.stop(t + 0.11);
        }

        const nextTime = 7000 + Math.random() * 7000;
        this.zenFrogsTimeout = setTimeout(playFrogs, nextTime);
      };
      playFrogs();
    }
    else if (soundId === 'temple_bell') {
      // A deep, distant temple bell with a long natural decay, heard very occasionally
      const playBell = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        
        const frequencies = [90.0, 135.2, 180.5, 270.1];
        frequencies.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const bellGain = this.ctx.createGain();
          bellGain.gain.setValueAtTime(0, now);
          bellGain.gain.linearRampToValueAtTime(idx === 0 ? 0.35 : 0.18, now + 0.05);
          bellGain.gain.exponentialRampToValueAtTime(0.001, now + 8.5); // long resonance decay

          osc.connect(bellGain);
          bellGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 9.0);
        });

        // Trigger every 45 to 70 seconds to preserve the meditative atmosphere
        const nextTime = 45000 + Math.random() * 25000;
        this.templeBellTimeout = setTimeout(playBell, nextTime);
      };
      this.templeBellTimeout = setTimeout(playBell, 4000);
    }
    else if (soundId === 'furin_chime') {
      // A delicate Japanese wind chime ringing softly and infrequently as the breeze passes
      const playChime = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;

        const frequencies = [2300.0, 3450.0, 4600.0];
        frequencies.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const chimeGain = this.ctx.createGain();
          chimeGain.gain.setValueAtTime(0, now);
          chimeGain.gain.linearRampToValueAtTime(idx === 0 ? 0.08 : 0.03, now + 0.005);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(chimeGain);
          chimeGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 2.0);
        });

        const nextTime = 14000 + Math.random() * 14000;
        this.furinChimeTimeout = setTimeout(playChime, nextTime);
      };
      this.furinChimeTimeout = setTimeout(playChime, 8000 + Math.random() * 8000);
    }
    else if (soundId === 'overseas_ngyn') {
      // Overseas ngyn: slow, peaceful Japanese garden pentatonic lofi melody
      const playMelody = () => {
        if (!this.gains[soundId]) return;
        const now = this.ctx.currentTime;
        
        // Meditative pentatonic sequence (C4 -> D4 -> F4 -> G4 -> A4 -> G4 -> F4 -> D4)
        const notes = [261.63, 293.66, 349.23, 392.00, 440.00, 392.00, 349.23, 293.66];
        const noteIdx = Math.floor(now / 4.0) % notes.length;
        const freq = notes[noteIdx];

        // Soft, gentle sine carriers for pluck feel
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        const pluckGain = this.ctx.createGain();
        pluckGain.gain.setValueAtTime(0, now);
        pluckGain.gain.linearRampToValueAtTime(0.16, now + 0.15); // soft pluck attack
        pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8); // long soothing decay

        // Spacious feedback delay
        const delayNode = this.ctx.createDelay(5.0);
        delayNode.delayTime.setValueAtTime(1.5, now);
        const delayGain = this.ctx.createGain();
        delayGain.gain.setValueAtTime(0.35, now);

        osc.connect(filter);
        filter.connect(pluckGain);
        pluckGain.connect(gainNode);

        pluckGain.connect(delayNode);
        delayNode.connect(delayGain);
        delayGain.connect(gainNode);
        delayGain.connect(delayNode); // feedback

        osc.start(now);
        osc.stop(now + 4.0);

        this.overseasNgynTimeout = setTimeout(playMelody, 4000);
      };
      playMelody();
    }

    this.sources[soundId] = sourceNodes;
  }

  stop(soundId) {
    if (soundId === 'canopy_rain') this.stop('rain');
    if (soundId === 'jungle_breeze') this.stop('wind');
    if (soundId === 'leaf_drips') clearTimeout(this.leafDripsTimeout);
    if (soundId === 'glass_frogs') clearTimeout(this.glassFrogsTimeout);
    if (soundId === 'tree_frogs') clearTimeout(this.treeFrogsTimeout);
    if (soundId === 'toucan') clearTimeout(this.toucanTimeout);
    if (soundId === 'creek_splashes') clearTimeout(this.creekSplashesTimeout);
    if (soundId === 'howler_monkey' || soundId === 'howler_calls') clearTimeout(this.howlerTimeout);
    if (soundId === 'cicadas') clearTimeout(this.cicadasTimeout);
    if (soundId === 'macaw_calls') clearTimeout(this.macawTimeout);
    if (soundId === 'bamboo_flute') clearTimeout(this.bambooFluteTimeout);
    if (soundId === 'marimba_tones') clearTimeout(this.marimbaTimeout);
    if (soundId === 'longing_aurdos') clearTimeout(this.longingAurdosTimeout);
    
    // Dubai desert sound timeouts
    if (soundId === 'campfire_glow') clearTimeout(this.campfireGlowTimeout);
    if (soundId === 'oasis_ripples') clearTimeout(this.oasisRipplesTimeout);
    if (soundId === 'desert_insects') clearTimeout(this.desertInsectsTimeout);
    if (soundId === 'ney_echo') clearTimeout(this.neyEchoTimeout);
    if (soundId === 'leben_dieter_huber') clearTimeout(this.lebenDieterHuberTimeout);
    
    // Mountain valley sound timeouts
    if (soundId === 'creek_pebbles') clearTimeout(this.creekPebblesTimeout);
    if (soundId === 'soft_songbirds') clearTimeout(this.softSongbirdsTimeout);
    if (soundId === 'aeolian_harp') clearTimeout(this.aeolianHarpTimeout);
    if (soundId === 'windstorm_erik_reno') clearTimeout(this.windstormErikRenoTimeout);
    
    // Pacific Northwest sound timeouts
    if (soundId === 'pnw_drips') clearTimeout(this.pnwDripsTimeout);
    if (soundId === 'pnw_frogs') clearTimeout(this.pnwFrogsTimeout);
    if (soundId === 'pnw_birds') clearTimeout(this.pnwBirdsTimeout);
    if (soundId === 'pnw_foghorn') clearTimeout(this.pnwFoghornTimeout);
    if (soundId === 'photograph_noham_st_pierre') clearTimeout(this.photographTimeout);

    // Polynesian Coast sound timeouts
    if (soundId === 'palm_rustle') clearTimeout(this.palmRustleTimeout);
    if (soundId === 'lagoon_ripples') clearTimeout(this.lagoonRipplesTimeout);
    if (soundId === 'night_crickets') clearTimeout(this.nightCricketsTimeout);
    if (soundId === 'poly_frogs') clearTimeout(this.polyFrogsTimeout);
    if (soundId === 'distant_seabirds') clearTimeout(this.distantSeabirdsTimeout);
    if (soundId === 'relaxing_ambience_soothing_sounds') clearTimeout(this.relaxingAmbienceTimeout);

    // Japanese Garden sound timeouts
    if (soundId === 'tsukubai_drips') clearTimeout(this.tsukubaiTimeout);
    if (soundId === 'zen_crickets') clearTimeout(this.zenCricketsTimeout);
    if (soundId === 'zen_frogs') clearTimeout(this.zenFrogsTimeout);
    if (soundId === 'temple_bell') clearTimeout(this.templeBellTimeout);
    if (soundId === 'furin_chime') clearTimeout(this.furinChimeTimeout);
    if (soundId === 'overseas_ngyn') clearTimeout(this.overseasNgynTimeout);
    
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
  selectDestination,
  DESTINATIONS,
  isPlaying,
  togglePlayback,
  activeSounds,
  toggleSound,
  soundVolumes,
  handleVolumeChange,
  timeLeft,
  isNight
}) {
  const [localTime, setLocalTime] = useState('')
  const [localDate, setLocalDate] = useState('')
  
  // Real-time touch drag & smooth slide physics
  const [touchStart, setTouchStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [slideAnim, setSlideAnim] = useState('')

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

  // Touch Swipe Handlers for smooth 1:1 dragging with gesture isolation
  const isSoundContainerTouch = (e) => {
    if (!e || !e.target) return false
    return (
      e.target.closest('.mobile-sound-drawer-sheet') !== null ||
      e.target.closest('.drawer-scroll-container') !== null ||
      e.target.closest('.drawer-sound-card') !== null ||
      e.target.closest('.drawer-card-volume') !== null ||
      e.target.closest('.places-scroll-container') !== null ||
      e.target.closest('.place-card') !== null ||
      e.target.closest('.testimonials-wrapper') !== null ||
      e.target.closest('.testimonial-card') !== null
    )
  }

  const handleTouchStart = (e) => {
    if (isSoundContainerTouch(e)) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }
    setTouchStart(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || isSoundContainerTouch(e)) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStart
    setDragOffset(diff)
  }

  const switchSlide = (newIndex, dir) => {
    setSlideAnim(`out-${dir}`)
    setTimeout(() => {
      selectDestination(newIndex)
      setSlideAnim(`in-${dir}`)
      setDragOffset(0)
      setTimeout(() => setSlideAnim(''), 250)
    }, 120)
  }

  const handleTouchEnd = (e) => {
    if (!isDragging || (e && isSoundContainerTouch(e))) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }
    setIsDragging(false)
    const threshold = 45

    if (dragOffset < -threshold) {
      // Swiped left -> Next location
      const nextIndex = (activeDestination + 1) % DESTINATIONS.length
      switchSlide(nextIndex, 'left')
    } else if (dragOffset > threshold) {
      // Swiped right -> Previous location
      const prevIndex = (activeDestination - 1 + DESTINATIONS.length) % DESTINATIONS.length
      switchSlide(prevIndex, 'right')
    } else {
      setDragOffset(0)
    }
  }

  const goToPrev = (e) => {
    e.stopPropagation()
    const prevIndex = (activeDestination - 1 + DESTINATIONS.length) % DESTINATIONS.length
    switchSlide(prevIndex, 'right')
  }

  const goToNext = (e) => {
    e.stopPropagation()
    const nextIndex = (activeDestination + 1) % DESTINATIONS.length
    switchSlide(nextIndex, 'left')
  }

  return (
    <div 
      className="mobile-immersive-hero"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Immersive background layers with smooth crossfade */}
      {DESTINATIONS.map((item, idx) => {
        const bgImg = (isNight && item.imageNight) ? item.imageNight : item.image;
        return (
          <div 
            key={item.id}
            className={`mobile-hero-bg ${idx === activeDestination ? 'active' : ''}`}
            style={{ backgroundImage: `url(${bgImg})` }}
          />
        );
      })}

      {/* Sun/Moon light glow overlay */}
      <div className={`mobile-hero-glow ${activeDestination === 1 ? 'dunes' : activeDestination === 2 ? 'alpine' : activeDestination === 0 ? 'forest' : 'ambient'}`} />
      
      {/* Night Desert Immersive Environment Animations */}
      {activeDestination === 1 && (
        <div className="dunes-desert-environment">
          <div className="dunes-moon-glow" />

          {/* 1. Desert Wind */}
          {activeSounds.includes('dunes_wind') && isPlaying && (
            <div className="dunes-wind-layer">
              <div className="dunes-wind-sweep" />
            </div>
          )}

          {/* 2. Sand Whisper */}
          {activeSounds.includes('sand_whisper') && isPlaying && (
            <div className="dunes-sand-layer">
              <span className="dunes-sand-grain sg1" />
              <span className="dunes-sand-grain sg2" />
            </div>
          )}

          {/* 3. Oasis Water Ripples */}
          {activeSounds.includes('oasis_ripples') && isPlaying && (
            <div className="dunes-oasis-layer">
              <span className="dunes-oasis-ripple or1" />
              <span className="dunes-oasis-ripple or2" />
            </div>
          )}

          {/* 4. Campfire Glow */}
          {activeSounds.includes('campfire_glow') && isPlaying && (
            <div className="dunes-campfire-layer">
              <div className="dunes-fire-glow-aura" />
              <span className="dunes-fire-spark sp1" />
              <span className="dunes-fire-spark sp2" />
            </div>
          )}

          {/* 5. Tent Flutter */}
          {activeSounds.includes('tent_flutter') && isPlaying && (
            <div className="dunes-tent-flutter-layer" />
          )}

          {/* 6. Desert Night Insects */}
          {activeSounds.includes('desert_insects') && isPlaying && (
            <div className="dunes-insects-layer">
              <span className="dunes-bug-glow bg1" />
              <span className="dunes-bug-glow bg2" />
            </div>
          )}

          {/* 7. Ney Flute Echo */}
          {activeSounds.includes('ney_echo') && isPlaying && (
            <div className="dunes-ney-layer">
              <div className="dunes-ney-glow" />
            </div>
          )}

          {/* 8. Camel Bells */}
          {activeSounds.includes('camel_bells') && isPlaying && (
            <div className="dunes-camel-layer">
              <div className="dunes-camel-drift" />
            </div>
          )}

          {/* 9. Leben by Dieter Huber */}
          {activeSounds.includes('leben_dieter_huber') && isPlaying && (
            <div className="dunes-leben-layer">
              <div className="dunes-leben-aurora" />
            </div>
          )}
        </div>
      )}
      
      {/* Costa Rica Ancient Forest 7-Layer Parallax Environment */}
      {activeDestination === 0 && (
        <div className="cr-rainforest-environment">
          {/* LAYER 7 – LIGHTING (Volumetric God Rays & Cloud Shadows) */}
          <div className="cr-layer layer-7-lighting">
            <div className="volumetric-god-rays" />
            <div className="canopy-cloud-shadow" />
          </div>

          {/* LAYER 6 – BACKGROUND CANOPY (Distant Birds & Rare Howler Monkey) */}
          <div className="cr-layer layer-6-canopy">
            <div className="distant-canopy-mist" />
            <div className="distant-bird-flock">
              <span className="distant-bird b1" />
              <span className="distant-bird b2" />
            </div>
            {/* Barely visible distant Howler Monkey silhouette */}
            <div className="howler-monkey-rare" title="Distant Howler Monkey">
              <svg viewBox="0 0 40 40" fill="rgba(15, 23, 20, 0.75)" style={{ width: '22px', height: '22px' }}>
                <path d="M20,10 C16,10 13,13 13,17 C13,19 14,21 16,22 C15,24 13,27 10,29 C8,30 6,32 8,34 C10,36 14,33 17,31 C19,33 21,34 24,34 C28,34 31,31 31,27 C31,23 28,20 26,19 C27,17 27,14 25,12 C23,10 21,10 20,10 Z" />
              </svg>
            </div>
          </div>

          {/* LAYER 5 – ATMOSPHERIC FX (Drifting Mist, Spores & Bioluminescent Glows) */}
          <div className="cr-layer layer-5-atmosphere">
            <div className="stream-mist-fx" />
            <div className="sun-particle-spores">
              <span className="spore s1" />
              <span className="spore s2" />
              <span className="spore s3" />
              <span className="spore s4" />
              <span className="spore s5" />
            </div>
            <div className="bioluminescent-glow-fx">
              <span className="firefly f1" />
              <span className="firefly f2" />
            </div>
          </div>

          {/* LAYER 4 – MIDGROUND JUNGLE (Breathing Ferns & Vines) */}
          <div className="cr-layer layer-4-midground">
            <div className="midground-jungle-breathe" />
          </div>

          {/* LAYER 3 – MAIN STREAM (40% importance - Flowing Water, Ripples, Shimmer) */}
          <div className="cr-layer layer-3-stream">
            <div className="diagonal-stream-flow" />
            <div className="stream-surface-shimmer" />
            <div className="stream-cyan-reflections" />
            <div className="stream-water-ripples">
              <span className="stream-ripple r-1" />
              <span className="stream-ripple r-2" />
            </div>
          </div>

          {/* LAYER 2 – STREAM BANK (Moss Rocks, Drifting Leaves, Tree Frog) */}
          <div className="cr-layer layer-2-streambank">
            <div className="moss-rock-bank" />
            <div className="drifting-leaf-stream" />
            {/* Partially visible Tree Frog near stream bank */}
            <div className="tree-frog-streambank" title="Tree Frog near stream bank">
              <svg viewBox="0 0 30 20" fill="rgba(34, 197, 94, 0.85)" style={{ width: '18px', height: '14px' }}>
                <ellipse cx="15" cy="10" rx="9" ry="6" />
                <circle cx="9" cy="5" r="3" fill="#22c55e" />
                <circle cx="21" cy="5" r="3" fill="#22c55e" />
              </svg>
            </div>
          </div>

          {/* LAYER 1 – FOREGROUND (Wet Tropical Leaves, Falling Water Droplets & Hidden Glass Frog) */}
          <div className="cr-layer layer-1-foreground">
            <div className="fg-tropical-leaf-left" />
            <div className="fg-tropical-leaf-right" />
            
            {/* Water Droplets Forming & Falling */}
            <div className="fg-leaf-droplet-drop">
              <span className="dew-drop d1" />
              <span className="dew-drop d2" />
            </div>

            {/* Hidden Glass Frog breathing & blinking on foreground leaf */}
            <div className="fg-glass-frog" title="Hidden Glass Frog">
              <svg viewBox="0 0 40 30" style={{ width: '28px', height: '22px' }}>
                <ellipse cx="20" cy="18" rx="12" ry="8" fill="rgba(74, 222, 128, 0.8)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                <circle cx="13" cy="11" r="3.5" fill="rgba(134, 239, 172, 0.9)" />
                <circle cx="27" cy="11" r="3.5" fill="rgba(134, 239, 172, 0.9)" />
                <circle cx="13" cy="11" r="1.5" fill="#030205" className="frog-pupil-blink" />
                <circle cx="27" cy="11" r="1.5" fill="#030205" className="frog-pupil-blink" />
              </svg>
            </div>
          </div>

          {/* 1. Minimal Canopy Rain */}
          {(activeSounds.includes('canopy_rain') || activeSounds.includes('rain')) && isPlaying && (
            <div className="minimal-canopy-rain">
              <span className="rain-drop r1" />
              <span className="rain-drop r2" />
              <span className="rain-drop r3" />
              <span className="rain-drop r4" />
              <span className="rain-drop r5" />
              <span className="rain-drop r6" />
            </div>
          )}

          {/* 2. Leaf Drips */}
          {activeSounds.includes('leaf_drips') && isPlaying && (
            <div className="forest-drips-layer">
              {/* Rain falling drizzle */}
              <span className="forest-rain-drip rd1" />
              <span className="forest-rain-drip rd2" />
              <span className="forest-rain-drip rd3" />
              <span className="forest-rain-drip rd4" />
              
              {/* Falling leaves illustrations */}
              <div className="forest-falling-leaf fl1">
                <svg viewBox="0 0 24 24" fill="rgba(34, 197, 94, 0.5)" style={{ width: '16px', height: '16px' }}>
                  <path d="M17,8C14.24,8 12.07,9.68 11.23,12H19.75C19.9,11.37 20,10.7 20,10C20,6 15,3 15,3C15,3 12,8 12,8H9V10H10.1C10.04,10.65 10,11.31 10,12C10,16.42 13.58,20 18,20C18,20 21,15 21,12C21,9.79 19.21,8 17,8Z" />
                </svg>
              </div>
              <div className="forest-falling-leaf fl2">
                <svg viewBox="0 0 24 24" fill="rgba(74, 222, 128, 0.45)" style={{ width: '14px', height: '14px' }}>
                  <path d="M17,8C14.24,8 12.07,9.68 11.23,12H19.75C19.9,11.37 20,10.7 20,10C20,6 15,3 15,3C15,3 12,8 12,8H9V10H10.1C10.04,10.65 10,11.31 10,12C10,16.42 13.58,20 18,20C18,20 21,15 21,12C21,9.79 19.21,8 17,8Z" />
                </svg>
              </div>
              <div className="forest-falling-leaf fl3">
                <svg viewBox="0 0 24 24" fill="rgba(34, 197, 94, 0.4)" style={{ width: '12px', height: '12px' }}>
                  <path d="M17,8C14.24,8 12.07,9.68 11.23,12H19.75C19.9,11.37 20,10.7 20,10C20,6 15,3 15,3C15,3 12,8 12,8H9V10H10.1C10.04,10.65 10,11.31 10,12C10,16.42 13.58,20 18,20C18,20 21,15 21,12C21,9.79 19.21,8 17,8Z" />
                </svg>
              </div>
            </div>
          )}

          {/* 3. Waterfall Mist Shimmer */}
          {activeSounds.includes('waterfall') && isPlaying && (
            <div className="forest-waterfall-mist">
              <span className="mist-stream ms1" />
              <span className="mist-stream ms2" />
            </div>
          )}

          {/* 4. Tree Frogs Ripple Glow */}
          {activeSounds.includes('tree_frogs') && isPlaying && (
            <div className="forest-frogs-pulse">
              <span className="frog-glow fg1" />
              <span className="frog-glow fg2" />
            </div>
          )}

          {/* 5. Cicadas Sparkle Shimmer */}
          {activeSounds.includes('cicadas') && isPlaying && (
            <div className="forest-cicadas-sparkle">
              <span className="sparkle sp1" />
              <span className="sparkle sp2" />
              <span className="sparkle sp3" />
            </div>
          )}

          {/* 6. Macaw Calls Flight */}
          {activeSounds.includes('macaw_calls') && isPlaying && (
            <div className="forest-macaw-flight">
              <svg viewBox="0 0 60 30" fill="#ef4444" style={{ width: '45px', height: '22px' }}>
                <path d="M10,15 Q25,2 40,15 Q55,2 58,12 Q45,20 30,17 Q15,20 10,15 Z" />
              </svg>
            </div>
          )}

          {/* 7. Jungle Breeze Sway */}
          {activeSounds.includes('jungle_breeze') && isPlaying && (
            <div className="forest-breeze-overlay">
              <div className="breeze-wave bw1" />
              <div className="breeze-wave bw2" />
            </div>
          )}

          {/* 8. Howler Calls Echo Rings */}
          {(activeSounds.includes('howler_calls') || activeSounds.includes('howler_monkey')) && isPlaying && (
          <div className="forest-howler-echo">
              <span className="echo-ring er1" />
              <span className="echo-ring er2" />
            </div>
          )}
        </div>
      )}

      {/* Mountain Valley (Alpine Peaks) Parallax & Sound Environment Animations */}
      {activeDestination === 2 && (
        <div className="mv-valley-environment">
          {/* 1. Mountain Stream (constant anchor) */}
          {activeSounds.includes('mountain_stream') && isPlaying && (
            <div className="mv-stream-layer">
              <span className="mv-stream-flow" />
              <span className="mv-stream-shimmer" />
            </div>
          )}

          {/* 2. Alpine Breeze */}
          {activeSounds.includes('alpine_breeze') && isPlaying && (
            <div className="mv-breeze-layer">
              <div className="mv-breeze-sweep" />
            </div>
          )}

          {/* 3. Pine Rustle */}
          {activeSounds.includes('pine_rustle') && isPlaying && (
            <div className="mv-pine-sway-layer" />
          )}

          {/* 4. Creek Pebbles */}
          {activeSounds.includes('creek_pebbles') && isPlaying && (
            <div className="mv-pebbles-splashes">
              <span className="mv-pebble-ripple r1" />
              <span className="mv-pebble-ripple r2" />
            </div>
          )}

          {/* 5. Distant Waterfall */}
          {activeSounds.includes('distant_waterfall') && isPlaying && (
            <div className="mv-waterfall-mist">
              <div className="mv-mist-shimmer" />
            </div>
          )}

          {/* 6. Meadow Grass */}
          {activeSounds.includes('meadow_grass') && isPlaying && (
            <div className="mv-meadow-layer">
              <div className="mv-grass-blade gb1" />
              <div className="mv-grass-blade gb2" />
            </div>
          )}

          {/* 7. Soft Songbirds */}
          {activeSounds.includes('soft_songbirds') && isPlaying && (
            <div className="mv-bird-flight">
              <div className="mv-bird-light-point" />
            </div>
          )}

          {/* 8. Aeolian Harp Echo */}
          {activeSounds.includes('aeolian_harp') && isPlaying && (
            <div className="mv-aeolian-layer">
              <span className="mv-harp-swell" />
            </div>
          )}

          {/* 9. Windstorm by Erik Reno */}
          {activeSounds.includes('windstorm_erik_reno') && isPlaying && (
            <div className="mv-guitar-swells">
              <div className="mv-guitar-aura" />
            </div>
          )}
        </div>
      )}

      {/* Pacific Northwest (Misty Coastline) Immersive Sound Environment Animations */}
      {activeDestination === 3 && (
        <div className="pnw-coastal-environment">
          {/* 1. Forest Rain (constant anchor) */}
          {activeSounds.includes('pnw_rain') && isPlaying && (
            <div className="pnw-rain-layer">
              <span className="pnw-rain-drizzle r1" />
              <span className="pnw-rain-drizzle r2" />
            </div>
          )}

          {/* 2. Creek Flow */}
          {activeSounds.includes('pnw_creek') && isPlaying && (
            <div className="pnw-creek-layer">
              <span className="pnw-creek-shimmer" />
            </div>
          )}

          {/* 3. Cedar Drips */}
          {activeSounds.includes('pnw_drips') && isPlaying && (
            <div className="pnw-drips-layer">
              <span className="pnw-drip-point dp1" />
              <span className="pnw-drip-point dp2" />
            </div>
          )}

          {/* 4. Coastal Breeze */}
          {activeSounds.includes('pnw_breeze') && isPlaying && (
            <div className="pnw-breeze-layer">
              <div className="pnw-breeze-sweep" />
            </div>
          )}

          {/* 5. Ocean Swell (breath background) */}
          {activeSounds.includes('pnw_swell') && isPlaying && (
            <div className="pnw-ocean-layer" />
          )}

          {/* 6. Tree Frogs */}
          {activeSounds.includes('pnw_frogs') && isPlaying && (
            <div className="pnw-frogs-layer">
              <span className="pnw-frog-glow fg1" />
              <span className="pnw-frog-glow fg2" />
            </div>
          )}

          {/* 7. Songbirds */}
          {activeSounds.includes('pnw_birds') && isPlaying && (
            <div className="pnw-birds-layer">
              <div className="pnw-bird-glide" />
            </div>
          )}

          {/* 8. Fog Horn Echo */}
          {activeSounds.includes('pnw_foghorn') && isPlaying && (
            <div className="pnw-foghorn-layer">
              <div className="pnw-horn-swell" />
            </div>
          )}
        </div>
      )}

      {/* Rain animation overlay fallback */}
      {isPlaying && activeSounds.includes('rain') && activeDestination !== 0 && (
        <div className="mobile-rain-overlay" />
      )}
      {/* Snow animation overlay */}
      {isPlaying && activeSounds.includes('snow') && (
        <div className="mobile-snow-overlay" />
      )}


      {/* Interactive Touch Slider Container */}
      <div 
        className={`mobile-hero-content-slider ${isDragging ? 'is-dragging' : 'is-smooth'} ${slideAnim}`}
        style={{
          transform: isDragging 
            ? `translateX(${dragOffset}px)`
            : dragOffset !== 0
            ? `translateX(${dragOffset}px)`
            : 'none',
          opacity: isDragging ? Math.max(0.65, 1 - Math.abs(dragOffset) / 450) : 1
        }}
      >
        {/* Minimalist Floating Location Navigation */}
        <div className="mobile-location-minimal-header">
          <button 
            className="minimal-arrow left" 
            onClick={goToPrev}
            aria-label="Previous Location"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="minimal-location-info">
            <h2 className="minimal-dest-title">{dest.title}</h2>
            <span 
              className="minimal-dest-sublocation"
              style={{
                color: dest.accentColor || 'rgba(255, 255, 255, 0.65)',
                textShadow: `0 0 10px ${dest.glowColor || 'rgba(0,0,0,0.5)'}`
              }}
            >
              {dest.location}
            </span>
          </div>

          <button 
            className="minimal-arrow right" 
            onClick={goToNext}
            aria-label="Next Location"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Sleek Progress Dots with Dynamic Accent Glow */}
        <div className="mobile-minimal-dots">
          {DESTINATIONS.map((d, index) => {
            const isSel = index === activeDestination
            return (
              <button
                key={d.id}
                className={`minimal-dot ${isSel ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  selectDestination(index)
                }}
                style={
                  isSel
                    ? {
                        backgroundColor: dest.accentColor || '#ffffff',
                        boxShadow: `0 0 10px ${dest.glowColor || 'rgba(255, 255, 255, 0.6)'}`
                      }
                    : undefined
                }
                aria-label={`Go to ${d.title}`}
              />
            )
          })}
        </div>

        {/* Minimal Weather Bar Pill */}
        <div className="mobile-minimal-weather-bar">
          <span className="weather-temp-badge">{tempVal}°</span>
          <span className="weather-divider">•</span>
          <span className="weather-condition">{weatherDesc || 'Calm'}</span>
          <span className="weather-divider">•</span>
          <span className="weather-time">{localTime}</span>
        </div>

        {/* Central Playback & Interactive Ring */}
        <div className="mobile-hero-playback-section">
          <div className="mobile-playback-ring-wrapper">
            <svg className={`timer-svg ${isPlaying ? 'playing' : ''}`} width="102" height="102">
              <circle 
                className="timer-ring-bg"
                cx="51" 
                cy="51" 
                r="47" 
              />
              <circle 
                className="timer-ring-fill"
                cx="51" 
                cy="51" 
                r="47"
                stroke={dest.accentColor || '#ffffff'}
                strokeDasharray={2 * Math.PI * 47}
                strokeDashoffset={(2 * Math.PI * 47) - (progressRatio * 2 * Math.PI * 47)}
              />
            </svg>
            <button 
              className={`mobile-main-play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={togglePlayback}
              style={{
                '--btn-glow-color': dest.accentColor || 'rgba(255, 255, 255, 0.3)',
                borderColor: isPlaying ? (dest.accentColor || 'rgba(255, 255, 255, 0.25)') : undefined
              }}
              aria-label={isPlaying ? 'Pause ambient soundscape' : 'Play ambient soundscape'}
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '4px' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphic Sound Drawer Sheet */}
      <div 
        className="mobile-sound-drawer-sheet"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="drawer-handle" />

        <div 
          className="drawer-scroll-container"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {getMixSounds(activeDestination).map((sound) => {
            const isActive = activeSounds.includes(sound.id)
            const IconComponent = sound.icon
            return (
              <div 
                key={sound.id} 
                className={`drawer-sound-card ${isActive ? 'active' : ''}`}
                onClick={() => toggleSound(sound.id)}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <div className="sound-card-icon-box">
                  <IconComponent size={22} className="sound-card-icon" />
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
    description: 'A peaceful rainforest sanctuary after a gentle rainfall. Crystal-clear stream, leaf drips, soft insects, glass & tree frogs, canopy breeze, creek splashes & distant howler monkey.',
    image: '/costa_rica_ancient_forest_night.jpg',
    imageNight: '/costa_rica_ancient_forest_night.jpg',
    weather: 'Warm Rain 24°C',
    accentColor: '#34d399', // Mint Emerald
    glowColor: 'rgba(52, 211, 153, 0.45)',
    sounds: ['Rainforest Stream', 'Leaves & Rain Drips', 'Toucan', 'Glass Frog Chorus', 'Tree Frog Calls', 'Canopy Breeze', 'Creek Splashes', 'Distant Howler', 'Longing by Aurdos'],
    volPreset: {
      rainforest_stream: 40,
      leaf_drips: 15,
      toucan: 15,
      glass_frogs: 10,
      tree_frogs: 10,
      canopy_breeze: 5,
      creek_splashes: 3,
      howler_monkey: 2,
      longing_aurdos: 30
    }
  },
  {
    id: 'desert',
    title: 'Celestial Dunes',
    location: 'Dubai Sand Dunes',
    description: 'Breathe in the cool desert air as the dry wind whispers over shifting sands under a dome of stars.',
    image: '/celestial_desert_night.jpg',
    imageNight: '/celestial_desert_night.jpg',
    weather: 'Clear Sky 18°C',
    accentColor: '#fcd34d', // Celestial Sand Gold
    glowColor: 'rgba(252, 211, 77, 0.45)',
    sounds: ['Desert Wind', 'Sand Whisper', 'Oasis Water Ripples', 'Campfire Glow', 'Tent Flutter', 'Desert Night Insects', 'Ney Flute Echo', 'Camel Bells', 'Leben by Dieter Huber'],
    volPreset: {
      dunes_wind: 40,
      sand_whisper: 15,
      oasis_ripples: 12,
      campfire_glow: 10,
      tent_flutter: 8,
      desert_insects: 7,
      ney_echo: 5,
      camel_bells: 3,
      leben_dieter_huber: 30
    }
  },
  {
    id: 'alpine',
    title: 'Alpine Peaks',
    location: 'Mountain Valley',
    description: 'Sit beside a roaring glacier stream as gusty mountain winds brush past the snowy heights.',
    image: '/alpine_peaks_night.jpg',
    imageNight: '/alpine_peaks_night.jpg',
    weather: 'Chilly Breeze -2°C',
    accentColor: '#38bdf8', // Glacial Sky Blue
    glowColor: 'rgba(56, 189, 248, 0.45)',
    sounds: ['Mountain Stream', 'Alpine Breeze', 'Pine Rustle', 'Creek Pebbles', 'Distant Waterfall', 'Meadow Grass', 'Soft Songbirds', 'Aeolian Harp Echo', 'Windstorm by Erik Reno'],
    volPreset: {
      mountain_stream: 40,
      alpine_breeze: 18,
      pine_rustle: 12,
      creek_pebbles: 8,
      distant_waterfall: 7,
      meadow_grass: 5,
      soft_songbirds: 5,
      aeolian_harp: 5,
      windstorm_erik_reno: 30
    }
  },
  {
    id: 'pnw',
    title: 'Misty Coastline',
    location: 'Pacific Northwest',
    description: 'An ancient cedar and Douglas fir forest overlooking a misty coastline. Gentle forest rain falls through towers of evergreens as the ocean waves swell in the distance.',
    image: '/pacific_northwest_night.jpg',
    imageNight: '/pacific_northwest_night.jpg',
    weather: 'Misty Rain 12°C',
    accentColor: '#2dd4bf', // Coastal Mint Teal
    glowColor: 'rgba(45, 212, 191, 0.45)',
    sounds: ['Forest Rain', 'Creek Flow', 'Cedar Drips', 'Coastal Breeze', 'Ocean Swell', 'Tree Frogs', 'Songbirds', 'Fog Horn Echo', 'Photograph by Noham St Pierre'],
    volPreset: {
      pnw_rain: 35,
      pnw_creek: 22,
      pnw_drips: 12,
      pnw_breeze: 10,
      pnw_swell: 8,
      pnw_frogs: 5,
      pnw_birds: 5,
      pnw_foghorn: 3,
      photograph_noham_st_pierre: 30
    }
  },
  {
    id: 'ocean',
    title: 'Deep Ocean',
    location: 'Polynesian Coast',
    description: 'Relax to the slow, heavy rise and fall of giant Pacific waves breaking on a warm sandy shore.',
    image: '/polynesian_coast.jpg',
    imageNight: '/polynesian_coast.jpg',
    weather: 'Tropical Breeze 26°C',
    accentColor: '#38bdf8', // Pacific Marine Cyan
    glowColor: 'rgba(56, 189, 248, 0.5)',
    sounds: ['Deep Ocean Swell', 'Gentle Reef Wash', 'Trade Wind Breeze', 'Palm Frond Rustle', 'Coral Lagoon Ripples', 'Night Crickets', 'Tree Frog Chorus', 'Distant Seabirds', 'Relaxing Ambience Soothing Sounds'],
    volPreset: {
      ocean_swell: 45,
      gentle_reef: 30,
      trade_wind: 20,
      palm_rustle: 15,
      lagoon_ripples: 10,
      night_crickets: 8,
      poly_frogs: 5,
      distant_seabirds: 4,
      relaxing_ambience_soothing_sounds: 30
    }
  },
  {
    id: 'zen',
    title: 'Japanese Garden',
    location: 'Kyoto Sanctuary',
    description: 'Sip tea near a trickling bamboo fountain while cherry blossom petals fall silently into the pond.',
    image: '/kyoto_sanctuary.jpg',
    imageNight: '/kyoto_sanctuary.jpg',
    weather: 'Mist Fog 16°C',
    accentColor: '#f472b6', // Sakura Violet Pink
    glowColor: 'rgba(244, 114, 182, 0.5)',
    sounds: [
      'Bamboo Grove Rustle',
      'Tsukubai Water Drips',
      'Garden Stream Flow',
      'Temple Bell Resonance',
      'Night Crickets',
      'Japanese Tree Frog Calls',
      'Maple & Pine Leaf Rustle',
      'Glass Fūrin Wind Chime',
      'Overseas ngyn'
    ],
    volPreset: {
      garden_stream: 65,
      bamboo_rustle: 50,
      tsukubai_drips: 25,
      maple_rustle: 20,
      zen_crickets: 12,
      zen_frogs: 10,
      temple_bell: 3,
      furin_chime: 2,
      overseas_ngyn: 35
    }
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

// Dynamic Mixer Sounds selector for all 6 location soundscapes
const getMixSounds = (activeDest) => {
  if (activeDest === 0) {
    // Ancient Forest (Costa Rica Rain Forest)
    return [
      { id: 'rainforest_stream', name: 'Rainforest Stream', icon: Droplet, color: '#38bdf8' },
      { id: 'leaf_drips', name: 'Leaves & Rain Drips', icon: CloudRain, color: '#60a5fa' },
      { id: 'toucan', name: 'Toucan', icon: BirdIcon, color: '#facc15' },
      { id: 'glass_frogs', name: 'Glass Frog Chorus', icon: Volume2, color: '#4ade80' },
      { id: 'tree_frogs', name: 'Tree Frog Calls', icon: Volume2, color: '#22c55e' },
      { id: 'canopy_breeze', name: 'Canopy Breeze', icon: Wind, color: '#a7f3d0' },
      { id: 'creek_splashes', name: 'Creek Splashes', icon: Droplet, color: '#0ea5e9' },
      { id: 'howler_monkey', name: 'Distant Howler', icon: Volume2, color: '#fb923c' },
      { id: 'longing_aurdos', name: 'Longing by Aurdos', icon: Music, color: '#f472b6' }
    ];
  } else if (activeDest === 1) {
    // Celestial Dunes (Dubai Sand Dunes)
    return [
      { id: 'dunes_wind', name: 'Desert Wind', icon: Wind, color: '#f59e0b' },
      { id: 'sand_whisper', name: 'Sand Whisper', icon: Sliders, color: '#fbbf24' },
      { id: 'oasis_ripples', name: 'Oasis Water Ripples', icon: Droplet, color: '#38bdf8' },
      { id: 'campfire_glow', name: 'Campfire Glow', icon: Flame, color: '#ea580c' },
      { id: 'tent_flutter', name: 'Tent Flutter', icon: Layers, color: '#94a3b8' },
      { id: 'desert_insects', name: 'Desert Night Insects', icon: Sparkles, color: '#34d399' },
      { id: 'ney_echo', name: 'Ney Flute Echo', icon: Music, color: '#818cf8' },
      { id: 'camel_bells', name: 'Camel Bells', icon: Bell, color: '#fb7185' },
      { id: 'leben_dieter_huber', name: 'Leben by Dieter Huber', icon: Music, color: '#f472b6' }
    ];
  } else if (activeDest === 2) {
    // Alpine Peaks (Mountain Valley)
    return [
      { id: 'mountain_stream', name: 'Mountain Stream', icon: Droplet, color: '#38bdf8' },
      { id: 'alpine_breeze', name: 'Alpine Breeze', icon: Wind, color: '#cbd5e1' },
      { id: 'pine_rustle', name: 'Pine Rustle', icon: Layers, color: '#4ade80' },
      { id: 'creek_pebbles', name: 'Creek Pebbles', icon: Droplet, color: '#0ea5e9' },
      { id: 'distant_waterfall', name: 'Distant Waterfall', icon: Activity, color: '#818cf8' },
      { id: 'meadow_grass', name: 'Meadow Grass', icon: Wind, color: '#34d399' },
      { id: 'soft_songbirds', name: 'Soft Songbirds', icon: BirdIcon, color: '#facc15' },
      { id: 'aeolian_harp', name: 'Aeolian Harp Echo', icon: Music, color: '#c084fc' },
      { id: 'windstorm_erik_reno', name: 'Windstorm by Erik Reno', icon: Music, color: '#f472b6' }
    ];
  } else if (activeDest === 3) {
    // Pacific Northwest (Misty Coastline)
    return [
      { id: 'pnw_rain', name: 'Forest Rain', icon: CloudRain, color: '#38bdf8' },
      { id: 'pnw_creek', name: 'Creek Flow', icon: Droplet, color: '#60a5fa' },
      { id: 'pnw_drips', name: 'Cedar Drips', icon: CloudRain, color: '#4ade80' },
      { id: 'pnw_breeze', name: 'Coastal Breeze', icon: Wind, color: '#cbd5e1' },
      { id: 'pnw_swell', name: 'Ocean Swell', icon: Activity, color: '#0ea5e9' },
      { id: 'pnw_frogs', name: 'Tree Frogs', icon: Volume2, color: '#22c55e' },
      { id: 'pnw_birds', name: 'Songbirds', icon: BirdIcon, color: '#facc15' },
      { id: 'pnw_foghorn', name: 'Fog Horn Echo', icon: Volume2, color: '#a7f3d0' },
      { id: 'photograph_noham_st_pierre', name: 'Photograph by Noham St Pierre', icon: Music, color: '#f472b6' }
    ];
  } else if (activeDest === 4) {
    // Deep Ocean (Polynesian Coast)
    return [
      { id: 'ocean_swell', name: 'Deep Ocean Swell', icon: Activity, color: '#38bdf8' },
      { id: 'gentle_reef', name: 'Gentle Reef Wash', icon: Droplet, color: '#0ea5e9' },
      { id: 'trade_wind', name: 'Trade Wind Breeze', icon: Wind, color: '#cbd5e1' },
      { id: 'palm_rustle', name: 'Palm Frond Rustle', icon: Layers, color: '#4ade80' },
      { id: 'lagoon_ripples', name: 'Coral Lagoon Ripples', icon: Droplet, color: '#2dd4bf' },
      { id: 'night_crickets', name: 'Night Crickets', icon: Sparkles, color: '#34d399' },
      { id: 'poly_frogs', name: 'Tree Frog Chorus', icon: Volume2, color: '#22c55e' },
      { id: 'distant_seabirds', name: 'Distant Seabirds', icon: BirdIcon, color: '#fbbf24' },
      { id: 'relaxing_ambience_soothing_sounds', name: 'Relaxing Ambience Soothing Sounds', icon: Music, color: '#f472b6' }
    ];
  } else if (activeDest === 5) {
    // Japanese Garden (Kyoto Sanctuary)
    return [
      { id: 'garden_stream', name: 'Garden Stream Flow', icon: Droplet, color: '#38bdf8' },
      { id: 'bamboo_rustle', name: 'Bamboo Grove Rustle', icon: Wind, color: '#4ade80' },
      { id: 'tsukubai_drips', name: 'Tsukubai Water Drips', icon: CloudRain, color: '#60a5fa' },
      { id: 'maple_rustle', name: 'Maple & Pine Leaf Rustle', icon: Layers, color: '#facc15' },
      { id: 'zen_crickets', name: 'Night Crickets', icon: Sparkles, color: '#a7f3d0' },
      { id: 'zen_frogs', name: 'Japanese Tree Frog Calls', icon: Volume2, color: '#22c55e' },
      { id: 'temple_bell', name: 'Temple Bell Resonance', icon: Bell, color: '#fb7185' },
      { id: 'furin_chime', name: 'Glass Fūrin Wind Chime', icon: Music, color: '#c084fc' },
      { id: 'overseas_ngyn', name: 'Overseas ngyn', icon: Music, color: '#f472b6' }
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
    sounds: { ocean_swell: 75, gentle_reef: 45, trade_wind: 35, palm_rustle: 25 }
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
  const [activeDestination, setActiveDestination] = useState(0)

  // Phone Mockup Tilt Effect
  const [tiltStyle, setTiltStyle] = useState({})

  // Audio Playback Mock
  const [isPlaying, setIsPlaying] = useState(false)

  // Sound Mixer States - On first play rainforest_stream and longing_aurdos are selected by default
  const [activeSounds, setActiveSounds] = useState(['rainforest_stream', 'longing_aurdos'])
  const [soundVolumes, setSoundVolumes] = useState({
    rainforest_stream: 40,
    leaf_drips: 15,
    toucan: 15,
    glass_frogs: 10,
    tree_frogs: 10,
    canopy_breeze: 5,
    creek_splashes: 3,
    howler_monkey: 2,
    longing_aurdos: 30,
    dunes_wind: 40,
    sand_whisper: 15,
    oasis_ripples: 12,
    campfire_glow: 10,
    tent_flutter: 8,
    desert_insects: 7,
    ney_echo: 5,
    camel_bells: 3,
    mountain_stream: 40,
    alpine_breeze: 18,
    pine_rustle: 12,
    creek_pebbles: 8,
    distant_waterfall: 7,
    meadow_grass: 5,
    soft_songbirds: 5,
    aeolian_harp: 5,
    windstorm_erik_reno: 30,
    rain: 65,
    wind: 40,
    thunder: 30,
    fire: 50,
    ocean: 60,
    birds: 45,
    snow: 30,
    music: 50,
    ocean_swell: 45,
    gentle_reef: 30,
    trade_wind: 20,
    palm_rustle: 15,
    lagoon_ripples: 10,
    night_crickets: 8,
    poly_frogs: 5,
    distant_seabirds: 4,
    relaxing_ambience_soothing_sounds: 30,
    garden_stream: 65,
    bamboo_rustle: 50,
    tsukubai_drips: 25,
    maple_rustle: 20,
    zen_crickets: 12,
    zen_frogs: 10,
    temple_bell: 3,
    furin_chime: 2,
    overseas_ngyn: 35
  })

  // Selected Preset state
  const [activePreset, setActivePreset] = useState('forest_zen')

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
      // Stop any active synth sound that is no longer in activeSounds
      const currentGains = Object.keys(synthRef.current.gains)
      currentGains.forEach((soundId) => {
        if (!active.includes(soundId)) {
          synthRef.current.stop(soundId)
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

  // Silky smooth auto-transition when scrolling down from first fold
  useEffect(() => {
    let isTransitioning = false
    let startY = 0

    const handleFirstFoldWheel = (e) => {
      if (window.scrollY < 30 && e.deltaY > 0 && !isTransitioning) {
        isTransitioning = true
        const targetSection = document.getElementById('why-love') || document.querySelector('.section')
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
        }
        setTimeout(() => {
          isTransitioning = false
        }, 800)
      }
    }

    const handleFirstFoldTouchStart = (e) => {
      if (window.scrollY < 30) {
        startY = e.touches[0].clientY
      }
    }

    const handleFirstFoldTouchMove = (e) => {
      if (window.scrollY < 30 && startY > 0 && !isTransitioning) {
        const currentY = e.touches[0].clientY
        const diffY = startY - currentY
        if (diffY > 20) {
          isTransitioning = true
          startY = 0
          const targetSection = document.getElementById('why-love') || document.querySelector('.section')
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' })
          } else {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
          }
          setTimeout(() => {
            isTransitioning = false
          }, 800)
        }
      }
    }

    window.addEventListener('wheel', handleFirstFoldWheel, { passive: true })
    window.addEventListener('touchstart', handleFirstFoldTouchStart, { passive: true })
    window.addEventListener('touchmove', handleFirstFoldTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleFirstFoldWheel)
      window.removeEventListener('touchstart', handleFirstFoldTouchStart)
      window.removeEventListener('touchmove', handleFirstFoldTouchMove)
    }
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

  // Apply a destination zephyr preset - starts with primary sound selected only (plus longing_aurdos for Costa Rica)
  const selectDestination = (index, shouldScroll = false) => {
    setIsPlaying(false)
    if (synthRef.current) {
      synthRef.current.stopAll()
    }
    setActiveDestination(index)
    const dest = DESTINATIONS[index]
    const primarySound = Object.keys(dest.volPreset)[0]
    let activeKeys = [primarySound]
    if (index === 0) {
      activeKeys = [primarySound, 'longing_aurdos']
    } else if (index === 1) {
      activeKeys = [primarySound, 'leben_dieter_huber']
    } else if (index === 2) {
      activeKeys = [primarySound, 'windstorm_erik_reno']
    } else if (index === 3) {
      activeKeys = [primarySound, 'photograph_noham_st_pierre']
    } else if (index === 4) {
      activeKeys = [primarySound, 'relaxing_ambience_soothing_sounds']
    } else if (index === 5) {
      activeKeys = [primarySound, 'overseas_ngyn']
    }
    setActiveSounds(activeKeys)
    setSoundVolumes((prev) => {
      const nextVolumes = { ...prev, ...dest.volPreset }
      syncSynthEngine(false, activeKeys, nextVolumes)
      return nextVolumes
    })
    showToast(`Exploring destination: ${dest.title}`)
    if (shouldScroll) {
      const mixerEl = document.getElementById('sound-mixer')
      if (mixerEl) {
        mixerEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
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
            selectDestination={selectDestination}
            DESTINATIONS={DESTINATIONS}
            isPlaying={isPlaying}
            togglePlayback={togglePlayback}
            activeSounds={activeSounds}
            toggleSound={toggleSound}
            soundVolumes={soundVolumes}
            handleVolumeChange={handleVolumeChange}
            timeLeft={timeLeft}
            isNight={isNight}
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
                          backgroundImage: `url(${
                            (isNight && DESTINATIONS[activeDestination].imageNight)
                              ? DESTINATIONS[activeDestination].imageNight
                              : DESTINATIONS[activeDestination].image
                          })`,
                          opacity: isPlaying ? 0.35 : 0.15
                        }}
                      />
                      {/* Costa Rica Ancient Forest 7-Layer Parallax Environment */}
                      {activeDestination === 0 && (
                        <div className="cr-rainforest-environment">
                          {/* LAYER 7 – LIGHTING (Volumetric God Rays & Cloud Shadows) */}
                          <div className="cr-layer layer-7-lighting">
                            <div className="volumetric-god-rays" />
                            <div className="canopy-cloud-shadow" />
                          </div>

                          {/* LAYER 6 – BACKGROUND CANOPY (Distant Birds & Rare Howler Monkey) */}
                          <div className="cr-layer layer-6-canopy">
                            <div className="distant-canopy-mist" />
                            <div className="distant-bird-flock">
                              <span className="distant-bird b1" />
                              <span className="distant-bird b2" />
                            </div>
                            {/* Barely visible distant Howler Monkey silhouette */}
                            <div className="howler-monkey-rare" title="Distant Howler Monkey">
                              <svg viewBox="0 0 40 40" fill="rgba(15, 23, 20, 0.75)" style={{ width: '22px', height: '22px' }}>
                                <path d="M20,10 C16,10 13,13 13,17 C13,19 14,21 16,22 C15,24 13,27 10,29 C8,30 6,32 8,34 C10,36 14,33 17,31 C19,33 21,34 24,34 C28,34 31,31 31,27 C31,23 28,20 26,19 C27,17 27,14 25,12 C23,10 21,10 20,10 Z" />
                              </svg>
                            </div>
                          </div>

                          {/* LAYER 5 – ATMOSPHERIC FX (Drifting Mist, Spores & Bioluminescent Glows) */}
                          <div className="cr-layer layer-5-atmosphere">
                            <div className="stream-mist-fx" />
                            <div className="sun-particle-spores">
                              <span className="spore s1" />
                              <span className="spore s2" />
                              <span className="spore s3" />
                              <span className="spore s4" />
                              <span className="spore s5" />
                            </div>
                            <div className="bioluminescent-glow-fx">
                              <span className="firefly f1" />
                              <span className="firefly f2" />
                            </div>
                          </div>

                          {/* LAYER 4 – MIDGROUND JUNGLE (Breathing Ferns & Vines) */}
                          <div className="cr-layer layer-4-midground">
                            <div className="midground-jungle-breathe" />
                          </div>

                          {/* LAYER 3 – MAIN STREAM (40% importance - Flowing Water, Ripples, Shimmer) */}
                          <div className="cr-layer layer-3-stream">
                            <div className="diagonal-stream-flow" />
                            <div className="stream-surface-shimmer" />
                            <div className="stream-cyan-reflections" />
                            <div className="stream-water-ripples">
                              <span className="stream-ripple r-1" />
                              <span className="stream-ripple r-2" />
                            </div>
                          </div>

                          {/* LAYER 2 – STREAM BANK (Moss Rocks, Drifting Leaves, Tree Frog) */}
                          <div className="cr-layer layer-2-streambank">
                            <div className="moss-rock-bank" />
                            <div className="drifting-leaf-stream" />
                            {/* Partially visible Tree Frog near stream bank */}
                            <div className="tree-frog-streambank" title="Tree Frog near stream bank">
                              <svg viewBox="0 0 30 20" fill="rgba(34, 197, 94, 0.85)" style={{ width: '18px', height: '14px' }}>
                                <ellipse cx="15" cy="10" rx="9" ry="6" />
                                <circle cx="9" cy="5" r="3" fill="#22c55e" />
                                <circle cx="21" cy="5" r="3" fill="#22c55e" />
                              </svg>
                            </div>
                          </div>

                          {/* LAYER 1 – FOREGROUND (Wet Tropical Leaves, Falling Water Droplets & Hidden Glass Frog) */}
                          <div className="cr-layer layer-1-foreground">
                            <div className="fg-tropical-leaf-left" />
                            <div className="fg-tropical-leaf-right" />
                            
                            {/* Water Droplets Forming & Falling */}
                            <div className="fg-leaf-droplet-drop">
                              <span className="dew-drop d1" />
                              <span className="dew-drop d2" />
                            </div>

                            {/* Hidden Glass Frog breathing & blinking on foreground leaf */}
                            <div className="fg-glass-frog" title="Hidden Glass Frog">
                              <svg viewBox="0 0 40 30" style={{ width: '28px', height: '22px' }}>
                                <ellipse cx="20" cy="18" rx="12" ry="8" fill="rgba(74, 222, 128, 0.8)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                                <circle cx="13" cy="11" r="3.5" fill="rgba(134, 239, 172, 0.9)" />
                                <circle cx="27" cy="11" r="3.5" fill="rgba(134, 239, 172, 0.9)" />
                                <circle cx="13" cy="11" r="1.5" fill="#030205" className="frog-pupil-blink" />
                                <circle cx="27" cy="11" r="1.5" fill="#030205" className="frog-pupil-blink" />
                              </svg>
                            </div>
                          </div>

                          {/* 1. Minimal Canopy Rain */}
                          {(activeSounds.includes('canopy_rain') || activeSounds.includes('rain')) && isPlaying && (
                            <div className="minimal-canopy-rain">
                              <span className="rain-drop r1" />
                              <span className="rain-drop r2" />
                              <span className="rain-drop r3" />
                              <span className="rain-drop r4" />
                              <span className="rain-drop r5" />
                              <span className="rain-drop r6" />
                            </div>
                          )}

                          {/* 2. Leaf Drips */}
                          {activeSounds.includes('leaf_drips') && isPlaying && (
                            <div className="forest-drips-layer">
                              {/* Rain falling drizzle */}
                              <span className="forest-rain-drip rd1" />
                              <span className="forest-rain-drip rd2" />
                              <span className="forest-rain-drip rd3" />
                              <span className="forest-rain-drip rd4" />
                              
                              {/* Falling leaves illustrations */}
                              <div className="forest-falling-leaf fl1">
                                <svg viewBox="0 0 24 24" fill="rgba(34, 197, 94, 0.5)" style={{ width: '16px', height: '16px' }}>
                                  <path d="M17,8C14.24,8 12.07,9.68 11.23,12H19.75C19.9,11.37 20,10.7 20,10C20,6 15,3 15,3C15,3 12,8 12,8H9V10H10.1C10.04,10.65 10,11.31 10,12C10,16.42 13.58,20 18,20C18,20 21,15 21,12C21,9.79 19.21,8 17,8Z" />
                                </svg>
                              </div>
                              <div className="forest-falling-leaf fl2">
                                <svg viewBox="0 0 24 24" fill="rgba(74, 222, 128, 0.45)" style={{ width: '14px', height: '14px' }}>
                                  <path d="M17,8C14.24,8 12.07,9.68 11.23,12H19.75C19.9,11.37 20,10.7 20,10C20,6 15,3 15,3C15,3 12,8 12,8H9V10H10.1C10.04,10.65 10,11.31 10,12C10,16.42 13.58,20 18,20C18,20 21,15 21,12C21,9.79 19.21,8 17,8Z" />
                                </svg>
                              </div>
                              <div className="forest-falling-leaf fl3">
                                <svg viewBox="0 0 24 24" fill="rgba(34, 197, 94, 0.4)" style={{ width: '12px', height: '12px' }}>
                                  <path d="M17,8C14.24,8 12.07,9.68 11.23,12H19.75C19.9,11.37 20,10.7 20,10C20,6 15,3 15,3C15,3 12,8 12,8H9V10H10.1C10.04,10.65 10,11.31 10,12C10,16.42 13.58,20 18,20C18,20 21,15 21,12C21,9.79 19.21,8 17,8Z" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* 3. Waterfall Mist Shimmer */}
                          {activeSounds.includes('waterfall') && isPlaying && (
                            <div className="forest-waterfall-mist">
                              <span className="mist-stream ms1" />
                              <span className="mist-stream ms2" />
                            </div>
                          )}

                          {/* 4. Tree Frogs Ripple Glow */}
                          {activeSounds.includes('tree_frogs') && isPlaying && (
                            <div className="forest-frogs-pulse">
                              <span className="frog-glow fg1" />
                              <span className="frog-glow fg2" />
                            </div>
                          )}

                          {/* 5. Cicadas Sparkle Shimmer */}
                          {activeSounds.includes('cicadas') && isPlaying && (
                            <div className="forest-cicadas-sparkle">
                              <span className="sparkle sp1" />
                              <span className="sparkle sp2" />
                              <span className="sparkle sp3" />
                            </div>
                          )}

                          {/* 6. Macaw Calls Flight */}
                          {activeSounds.includes('macaw_calls') && isPlaying && (
                            <div className="forest-macaw-flight">
                              <svg viewBox="0 0 60 30" fill="#ef4444" style={{ width: '45px', height: '22px' }}>
                                <path d="M10,15 Q25,2 40,15 Q55,2 58,12 Q45,20 30,17 Q15,20 10,15 Z" />
                              </svg>
                            </div>
                          )}

                          {/* 7. Jungle Breeze Sway */}
                          {activeSounds.includes('jungle_breeze') && isPlaying && (
                            <div className="forest-breeze-overlay">
                              <div className="breeze-wave bw1" />
                              <div className="breeze-wave bw2" />
                            </div>
                          )}

                          {/* 8. Howler Calls Echo Rings */}
                          {(activeSounds.includes('howler_calls') || activeSounds.includes('howler_monkey')) && isPlaying && (
                            <div className="forest-howler-echo">
                              <span className="echo-ring er1" />
                              <span className="echo-ring er2" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Night Desert Animations inside phone preview */}
                      {activeDestination === 1 && (
                        <div className="dunes-desert-environment">
                          <div className="dunes-moon-glow" />

                          {/* 1. Desert Wind */}
                          {activeSounds.includes('dunes_wind') && isPlaying && (
                            <div className="dunes-wind-layer">
                              <div className="dunes-wind-sweep" />
                            </div>
                          )}

                          {/* 2. Sand Whisper */}
                          {activeSounds.includes('sand_whisper') && isPlaying && (
                            <div className="dunes-sand-layer">
                              <span className="dunes-sand-grain sg1" />
                              <span className="dunes-sand-grain sg2" />
                            </div>
                          )}

                          {/* 3. Oasis Water Ripples */}
                          {activeSounds.includes('oasis_ripples') && isPlaying && (
                            <div className="dunes-oasis-layer">
                              <span className="dunes-oasis-ripple or1" />
                              <span className="dunes-oasis-ripple or2" />
                            </div>
                          )}

                          {/* 4. Campfire Glow */}
                          {activeSounds.includes('campfire_glow') && isPlaying && (
                            <div className="dunes-campfire-layer">
                              <div className="dunes-fire-glow-aura" />
                              <span className="dunes-fire-spark sp1" />
                              <span className="dunes-fire-spark sp2" />
                            </div>
                          )}

                          {/* 5. Tent Flutter */}
                          {activeSounds.includes('tent_flutter') && isPlaying && (
                            <div className="dunes-tent-flutter-layer" />
                          )}

                          {/* 6. Desert Night Insects */}
                          {activeSounds.includes('desert_insects') && isPlaying && (
                            <div className="dunes-insects-layer">
                              <span className="dunes-bug-glow bg1" />
                              <span className="dunes-bug-glow bg2" />
                            </div>
                          )}

                          {/* 7. Ney Flute Echo */}
                          {activeSounds.includes('ney_echo') && isPlaying && (
                            <div className="dunes-ney-layer">
                              <div className="dunes-ney-glow" />
                            </div>
                          )}

                          {/* 8. Camel Bells */}
                          {activeSounds.includes('camel_bells') && isPlaying && (
                            <div className="dunes-camel-layer">
                              <div className="dunes-camel-drift" />
                            </div>
                          )}

                          {/* 9. Leben by Dieter Huber */}
                          {activeSounds.includes('leben_dieter_huber') && isPlaying && (
                            <div className="dunes-leben-layer">
                              <div className="dunes-leben-aurora" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mountain Valley (Alpine Peaks) Parallax & Sound Environment Animations */}
                      {activeDestination === 2 && (
                        <div className="mv-valley-environment">
                          {/* 1. Mountain Stream (constant anchor) */}
                          {activeSounds.includes('mountain_stream') && isPlaying && (
                            <div className="mv-stream-layer">
                              <span className="mv-stream-flow" />
                              <span className="mv-stream-shimmer" />
                            </div>
                          )}

                          {/* 2. Alpine Breeze */}
                          {activeSounds.includes('alpine_breeze') && isPlaying && (
                            <div className="mv-breeze-layer">
                              <div className="mv-breeze-sweep" />
                            </div>
                          )}

                          {/* 3. Pine Rustle */}
                          {activeSounds.includes('pine_rustle') && isPlaying && (
                            <div className="mv-pine-sway-layer" />
                          )}

                          {/* 4. Creek Pebbles */}
                          {activeSounds.includes('creek_pebbles') && isPlaying && (
                            <div className="mv-pebbles-splashes">
                              <span className="mv-pebble-ripple r1" />
                              <span className="mv-pebble-ripple r2" />
                            </div>
                          )}

                          {/* 5. Distant Waterfall */}
                          {activeSounds.includes('distant_waterfall') && isPlaying && (
                            <div className="mv-waterfall-mist">
                              <div className="mv-mist-shimmer" />
                            </div>
                          )}

                          {/* 6. Meadow Grass */}
                          {activeSounds.includes('meadow_grass') && isPlaying && (
                            <div className="mv-meadow-layer">
                              <div className="mv-grass-blade gb1" />
                              <div className="mv-grass-blade gb2" />
                            </div>
                          )}

                          {/* 7. Soft Songbirds */}
                          {activeSounds.includes('soft_songbirds') && isPlaying && (
                            <div className="mv-bird-flight">
                              <div className="mv-bird-light-point" />
                            </div>
                          )}

                          {/* 8. Aeolian Harp Echo */}
                          {activeSounds.includes('aeolian_harp') && isPlaying && (
                            <div className="mv-aeolian-layer">
                              <span className="mv-harp-swell" />
                            </div>
                          )}

                          {/* 9. Windstorm by Erik Reno */}
                          {activeSounds.includes('windstorm_erik_reno') && isPlaying && (
                            <div className="mv-guitar-swells">
                              <div className="mv-guitar-aura" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pacific Northwest (Misty Coastline) Immersive Sound Environment Animations */}
                      {activeDestination === 3 && (
                        <div className="pnw-coastal-environment">
                          {/* 1. Forest Rain (constant anchor) */}
                          {activeSounds.includes('pnw_rain') && isPlaying && (
                            <div className="pnw-rain-layer">
                              <span className="pnw-rain-drizzle r1" />
                              <span className="pnw-rain-drizzle r2" />
                            </div>
                          )}

                          {/* 2. Creek Flow */}
                          {activeSounds.includes('pnw_creek') && isPlaying && (
                            <div className="pnw-creek-layer">
                              <span className="pnw-creek-shimmer" />
                            </div>
                          )}

                          {/* 3. Cedar Drips */}
                          {activeSounds.includes('pnw_drips') && isPlaying && (
                            <div className="pnw-drips-layer">
                              <span className="pnw-drip-point dp1" />
                              <span className="pnw-drip-point dp2" />
                            </div>
                          )}

                          {/* 4. Coastal Breeze */}
                          {activeSounds.includes('pnw_breeze') && isPlaying && (
                            <div className="pnw-breeze-layer">
                              <div className="pnw-breeze-sweep" />
                            </div>
                          )}

                          {/* 5. Ocean Swell (breath background) */}
                          {activeSounds.includes('pnw_swell') && isPlaying && (
                            <div className="pnw-ocean-layer" />
                          )}

                          {/* 6. Tree Frogs */}
                          {activeSounds.includes('pnw_frogs') && isPlaying && (
                            <div className="pnw-frogs-layer">
                              <span className="pnw-frog-glow fg1" />
                              <span className="pnw-frog-glow fg2" />
                            </div>
                          )}

                          {/* 7. Songbirds */}
                          {activeSounds.includes('pnw_birds') && isPlaying && (
                            <div className="pnw-birds-layer">
                              <div className="pnw-bird-glide" />
                            </div>
                          )}

                          {/* 8. Fog Horn Echo */}
                          {activeSounds.includes('pnw_foghorn') && isPlaying && (
                            <div className="pnw-foghorn-layer">
                              <div className="pnw-horn-swell" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="phone-ui-header">
                        <Sliders size={18} className="phone-ui-title" />
                        <span className="phone-ui-title">Zephyr</span>
                        <Clock size={18} className="phone-ui-title" />
                      </div>

                      <div className="phone-ui-artwork-frame">
                        <img
                          src={
                            (isNight && DESTINATIONS[activeDestination].imageNight)
                              ? DESTINATIONS[activeDestination].imageNight
                              : DESTINATIONS[activeDestination].image
                          }
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

        {/* 3. Why You'll Love It Section */}
        <section className="section" id="why-love">
          <div className="section-header">
            <span className="section-tag">Pure Serenity</span>
            <h2 className="section-title">Designed to soothe your soul.</h2>
            <p className="section-desc">
              Discover beautiful nature sounds layered inside hand-drawn ambient illustrations. Build mixes to create your ultimate auditory refuge.
            </p>
          </div>

          {!isMobile && (
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
          )}
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

          {!isMobile && (
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
          )}
        </section>

        {/* 5. Personalized Scenarios Bento Grid - Atmospheres */}
        <section className="section" id="personalized">
          <div className="section-header">
            <span className="section-tag">Atmospheres</span>
            <h2 className="section-title">Designed for your lifestyle.</h2>
            <p className="section-desc">
              Whether you are locking down deep work focus, meditating at sunrise, or reading a novel, discover a tailored acoustic backdrop.
            </p>
          </div>

          {!isMobile && (
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
          )}
        </section>

        {!isMobile && (
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
                  onClick={() => selectDestination(index, true)}
                >
                  <img 
                    src={(isNight && place.imageNight) ? place.imageNight : place.image} 
                    alt={place.title} 
                    className="place-card-image" 
                    />
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
        )}

        {/* 7. Create Your Own Mix (Connected lines visual) */}
        <section className="section">
          <div className="section-header">
            <span className="section-tag">Infinite Mixes</span>
            <h2 className="section-title">Create your own atmospheric playlist.</h2>
            <p className="section-desc">
              Layer individual sound nodes together, save them as custom names (e.g. "My Rain Cabin Study"), and schedule automatic sleep timers.
            </p>
          </div>

          <div className="mix-section-wrapper">
            <div className="mix-content">
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

            {!isMobile && (
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
            )}
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
                <img src="/julian_avatar.png" alt="Julian DeVries" className="author-avatar" />
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
                <img src="/sarah_avatar.png" alt="Sarah Chen" className="author-avatar" />
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
              <h2 className="download-title">Relax with one tap.</h2>
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
