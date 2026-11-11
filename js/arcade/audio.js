/**
 * CHANCENVADERS 1978 - Mastered Procedural Web Audio Arcade Synthesizer
 * Enhanced with Dynamics Compressor, voice-limiting, smooth anti-pop envelopes,
 * and dedicated powerup/tower ascension sound effects.
 */

(function (window) {
  'use strict';

  class ArcadeAudio {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.isMuted = false;
      this.volume = 0.7;

      // 4-tone alien march frequencies (A1, G1, F1, D#1)
      this.marchFrequencies = [55.0, 49.0, 43.6, 38.9];
      this.marchIndex = 0;

      // UFO siren active nodes
      this.ufoOsc = null;
      this.ufoGain = null;
      this.ufoLfo = null;
      this.isUfoPlaying = false;

      // Throttle for laser sounds to prevent audio clipping
      this.lastShootTime = 0;

      this.unlocked = false;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API not supported.');
        return;
      }
      this.ctx = new AudioCtx();

      // Master Compressor to prevent any clipping or harsh distortion
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);

      this.unlocked = true;
    }

    ensureUnlocked() {
      if (!this.ctx) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.masterGain && this.ctx && !this.isMuted) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    /**
     * Alien March Beat: 4 descending deep bass thumps
     */
    playMarchNote() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const freq = this.marchFrequencies[this.marchIndex];
      this.marchIndex = (this.marchIndex + 1) % this.marchFrequencies.length;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.08);
    }

    resetMarch() {
      this.marchIndex = 0;
    }

    /**
     * Player Laser Shot: Crisp downward frequency chirp with voice limiter
     */
    playPlayerShoot() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      // Voice limiter: avoid muddy audio overlap on rapid fire
      if (now - this.lastShootTime < 0.055) return;
      this.lastShootTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    }

    /**
     * Plasma Piercing Beam Shot: Powerful deep synth zap
     */
    playPlasmaShoot() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.19);
    }

    /**
     * Alien Hit Explosion: Punchy filtered noise burst
     */
    playAlienExplosion() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const duration = 0.18;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + duration);
      filter.Q.setValueAtTime(2.2, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(this.ctx.currentTime);
    }

    /**
     * Player Death Explosion
     */
    playPlayerDeath() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      const duration = 1.1;

      // Low rumble noise
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      // Descending buzzer
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + duration);

      oscGain.gain.setValueAtTime(0.45, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      noise.start(now);
      osc.start(now);
      osc.stop(now + duration);
    }

    /**
     * UFO Siren
     */
    startUfoSiren() {
      if (!this.ctx || this.isMuted || this.isUfoPlaying) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      this.ufoOsc = this.ctx.createOscillator();
      this.ufoGain = this.ctx.createGain();
      this.ufoLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      this.ufoOsc.type = 'sawtooth';
      this.ufoOsc.frequency.setValueAtTime(520, now);

      this.ufoLfo.type = 'sine';
      this.ufoLfo.frequency.setValueAtTime(6.0, now);
      lfoGain.gain.setValueAtTime(130, now);

      this.ufoLfo.connect(this.ufoOsc.frequency);
      this.ufoGain.gain.setValueAtTime(0.2, now);

      this.ufoOsc.connect(this.ufoGain);
      this.ufoGain.connect(this.masterGain);

      this.ufoOsc.start(now);
      this.ufoLfo.start(now);
      this.isUfoPlaying = true;
    }

    stopUfoSiren() {
      if (!this.isUfoPlaying) return;
      try {
        if (this.ufoOsc) {
          this.ufoOsc.stop();
          this.ufoOsc.disconnect();
        }
        if (this.ufoLfo) {
          this.ufoLfo.stop();
          this.ufoLfo.disconnect();
        }
      } catch (e) {}
      this.ufoOsc = null;
      this.ufoLfo = null;
      this.isUfoPlaying = false;
    }

    /**
     * UFO Hit Sound
     */
    playUfoHit() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      this.stopUfoSiren();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1350, now);
      osc.frequency.setValueAtTime(1800, now + 0.07);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.33);
    }

    /**
     * Powerup Spawn: Tech ping
     */
    playPowerupSpawn() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.21);
    }

    /**
     * Powerup Collect: Ascending 4-tone victory arpeggio (C5 -> E5 -> G5 -> C6)
     */
    playPowerupCollect() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.13);
      });
    }

    /**
     * Shield Deflect / Energy Ping
     */
    playShieldDeflect() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.17);
    }

    /**
     * Orbital Nuke Detonation: Deep rolling sub-bass earthquake
     */
    playNukeDetonation() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.6);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.66);
    }

    /**
     * Tower Level Ascension: Futuristic hydraulic lift hum & warp chime
     */
    playTowerAscend() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;

      // Ascending warp chord
      const chords = [330, 440, 550, 660, 880, 1100];
      chords.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.25);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.27);
      });
    }

    /**
     * Coin Insert Tone
     */
    playCoinInsert() {
      if (!this.ctx || this.isMuted) return;
      this.ensureUnlocked();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.29);
    }
  }

  window.SpaceInvadersAudio = new ArcadeAudio();
})(window);
