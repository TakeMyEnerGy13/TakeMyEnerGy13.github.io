(() => {
  const stage = document.querySelector('.stage-world');
  const hero = document.querySelector('.prologue');
  const musicButton = document.querySelector('.music-toggle');
  const status = document.querySelector('.music-status');
  const root = document.documentElement;
  let inView = false;
  let playing = false;
  let busy = false;

  function syncAnimation() {
    const introCovered = root.classList.contains('intro-pending') && !root.classList.contains('intro-opening');
    stage.classList.toggle('is-running', inView && !document.hidden && !root.classList.contains('motion-paused') && !introCovered);
    musicButton.classList.toggle('is-playing', playing && !document.hidden);
  }
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio > .08;
    syncAnimation();
  }, { threshold: [0, .08] }).observe(hero);
  new MutationObserver(syncAnimation).observe(root, { attributes: true, attributeFilter: ['class'] });

  stage.querySelectorAll('.dancer').forEach(dancer => {
    dancer.addEventListener('click', () => {
      if (root.classList.contains('motion-paused') || dancer.classList.contains('is-leaping')) return;
      dancer.classList.add('is-leaping');
      setTimeout(() => dancer.classList.remove('is-leaping'), 680);
    });
  });

  // Original 16-bar D-minor waltz. Durations are in quarter-note beats.
  const score = [
    { bass: 38, chord: [57, 62, 65], melody: [[74, 1], [77, .5], [81, .5], [77, 1]] },
    { bass: 45, chord: [57, 61, 64, 67], melody: [[76, 1.5], [73, .5], [69, 1]] },
    { bass: 38, chord: [57, 62, 65], melody: [[74, .5], [76, .5], [77, 1], [81, 1]] },
    { bass: 38, chord: [57, 62, 65], melody: [[79, 1], [77, 1], [74, 1]] },
    { bass: 43, chord: [58, 62, 67], melody: [[79, 1], [82, .5], [81, .5], [79, 1]] },
    { bass: 38, chord: [57, 62, 65], melody: [[77, 1.5], [76, .5], [74, 1]] },
    { bass: 45, chord: [57, 61, 64, 67], melody: [[73, .5], [76, .5], [79, 1], [76, 1]] },
    { bass: 38, chord: [57, 62, 65], melody: [[74, 2.5], [0, .5]] },
    { bass: 46, chord: [58, 62, 65], melody: [[77, .5], [79, .5], [81, 1], [82, 1]] },
    { bass: 41, chord: [57, 60, 65], melody: [[81, 1.5], [77, .5], [72, 1]] },
    { bass: 43, chord: [58, 62, 67], melody: [[79, .5], [81, .5], [82, 1], [79, 1]] },
    { bass: 38, chord: [57, 62, 65], melody: [[77, 1], [76, .5], [74, .5], [69, 1]] },
    { bass: 40, chord: [56, 59, 62, 64], melody: [[76, 1], [80, 1], [83, 1]] },
    { bass: 45, chord: [57, 61, 64, 67], melody: [[81, .5], [79, .5], [76, 1], [73, 1]] },
    { bass: 38, chord: [57, 62, 65], melody: [[74, 1], [77, .5], [76, .5], [74, 1]] },
    { bass: 45, chord: [57, 61, 64], melody: [[73, 1.5], [69, .5], [0, 1]] }
  ];
  const beat = .6;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let context;
  let master;
  let instrumentWave;
  let scheduler;
  let nextBar = 0;
  let bar = 0;
  const voices = new Set();

  function createAudio() {
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0;
    const tone = context.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 4800;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 15;
    compressor.ratio.value = 3;
    master.connect(tone).connect(compressor).connect(context.destination);
    const echo = context.createDelay(.5);
    echo.delayTime.value = .18;
    const echoGain = context.createGain();
    echoGain.gain.value = .13;
    tone.connect(echo).connect(echoGain).connect(compressor);
    const real = new Float32Array(28);
    const imaginary = new Float32Array(28);
    for (let harmonic = 1; harmonic < imaginary.length; harmonic++) {
      imaginary[harmonic] = Math.pow(harmonic, -1.35) * (harmonic % 2 ? 1 : .75);
    }
    instrumentWave = context.createPeriodicWave(real, imaginary);
  }

  function note(midi, time, length, kind, volume) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const bowed = kind === 'bow';
    oscillator.frequency.value = frequency;
    if (bowed) oscillator.setPeriodicWave(instrumentWave);
    else oscillator.type = 'triangle';
    filter.type = 'lowpass';
    filter.frequency.value = bowed ? 2600 : kind === 'bass' ? 650 : 1400;
    filter.Q.value = .65;
    oscillator.connect(filter).connect(envelope).connect(master);
    const attack = bowed ? .07 : .012;
    const end = time + length;
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + attack);
    envelope.gain.exponentialRampToValueAtTime(volume * (bowed ? .75 : .15), Math.max(time + attack + .01, end - .08));
    envelope.gain.exponentialRampToValueAtTime(.0001, end + .1);
    let vibrato;
    let vibratoDepth;
    if (bowed) {
      vibrato = context.createOscillator();
      vibratoDepth = context.createGain();
      vibrato.frequency.value = 5.1;
      vibratoDepth.gain.setValueAtTime(0, time);
      vibratoDepth.gain.linearRampToValueAtTime(9, time + .18);
      vibrato.connect(vibratoDepth).connect(oscillator.detune);
      vibrato.start(time);
      vibrato.stop(end + .12);
    }
    const voice = { oscillator, vibrato };
    voices.add(voice);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
      vibrato?.disconnect();
      vibratoDepth?.disconnect();
      voices.delete(voice);
    };
    oscillator.start(time);
    oscillator.stop(end + .12);
  }

  function schedule() {
    while (nextBar < context.currentTime + .15) {
      const measure = score[bar % score.length];
      note(measure.bass, nextBar, beat * .8, 'bass', .17);
      for (const offset of [1, 2]) {
        measure.chord.forEach((pitch, index) => note(pitch, nextBar + beat * offset + index * .008, beat * .48, 'chord', .035));
      }
      let position = 0;
      measure.melody.forEach(([pitch, beats]) => {
        if (pitch) note(pitch, nextBar + position * beat, beats * beat * .94, 'bow', .115);
        position += beats;
      });
      bar++;
      nextBar += beat * 3;
    }
  }

  function updateMusicState() {
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Выключить музыку' : 'Включить музыку');
    musicButton.querySelector('.music-state').textContent = playing ? 'Ⅱ' : '▷';
    syncAnimation();
  }

  async function stopMusic() {
    playing = false;
    clearInterval(scheduler);
    updateMusicState();
    if (!context) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0, context.currentTime, .025);
    await new Promise(resolve => setTimeout(resolve, 100));
    voices.forEach(({ oscillator, vibrato }) => {
      oscillator.stop();
      vibrato?.stop();
    });
    await context.suspend();
  }

  if (!AudioContextClass) {
    musicButton.hidden = true;
  } else {
    musicButton.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      musicButton.setAttribute('aria-busy', 'true');
      try {
        if (playing) await stopMusic();
        else {
          if (!context) createAudio();
          await context.resume();
          if (context.state !== 'running' || document.hidden) throw new Error('Audio is not available');
          bar = 0;
          nextBar = context.currentTime + .1;
          playing = true;
          master.gain.cancelScheduledValues(context.currentTime);
          master.gain.setTargetAtTime(.55, context.currentTime, .15);
          schedule();
          scheduler = setInterval(schedule, 80);
          updateMusicState();
        }
        status.textContent = playing ? 'Музыка включена' : 'Музыка выключена';
      } catch {
        await stopMusic();
        status.textContent = 'Не удалось включить музыку. Попробуйте нажать на скрипку ещё раз.';
      } finally {
        busy = false;
        musicButton.removeAttribute('aria-busy');
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    syncAnimation();
    if (document.hidden && playing && !busy) {
      busy = true;
      stopMusic().finally(() => { busy = false; });
    }
  });
  window.addEventListener('pagehide', () => {
    clearInterval(scheduler);
    playing = false;
    if (context) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.value = 0;
      voices.forEach(({ oscillator, vibrato }) => { oscillator.stop(); vibrato?.stop(); });
      context.suspend();
    }
    updateMusicState();
  });
})();
