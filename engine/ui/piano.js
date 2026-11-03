// A small in-world piano for stations that opt into `data-piano`.
// It uses the browser's Web Audio API so the world does not need a second app
// bundle or a remote audio service just to let visitors play a few notes.

const WHITE_NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const WHITE_KEYS = Array.from({ length: 24 }, (_, index) => ({
  note: `${WHITE_NOTE_NAMES[index % 7]}${3 + Math.floor(index / 7)}`,
  jian: String((index % 7) + 1),
}));

const BLACK_KEYS = [];
for (let octave = 3; octave <= 6; octave++) {
  const offset = (octave - 3) * 7;
  for (const [name, jian, after] of [['C#', '#1', 0], ['D#', '#2', 1], ['F#', '#4', 3], ['G#', '#5', 4], ['A#', '#6', 5]]) {
    if (offset + after < WHITE_KEYS.length - 1) BLACK_KEYS.push({ note: `${name}${octave}`, jian, after: offset + after });
  }
}

const KEYBOARD_MAP = new Map([
  ['z', 'C3'], ['1', 'C#3'], ['x', 'D3'], ['2', 'D#3'], ['c', 'E3'], ['v', 'F3'],
  ['3', 'F#3'], ['b', 'G3'], ['4', 'G#3'], ['n', 'A3'], ['5', 'A#3'], ['m', 'B3'],
  ['a', 'C4'], ['w', 'C#4'], ['s', 'D4'], ['e', 'D#4'], ['d', 'E4'], ['f', 'F4'],
  ['t', 'F#4'], ['g', 'G4'], ['y', 'G#4'], ['h', 'A4'], ['u', 'A#4'], ['j', 'B4'],
  ['k', 'C5'], ['o', 'C#5'], ['l', 'D5'], ['p', 'D#5'], [';', 'E5'], ["'", 'F5'],
  ['q', 'G5'], ['6', 'F#5'], ['r', 'A5'], ['7', 'G#5'], ['i', 'B5'], ['8', 'A#5'],
  ['[', 'C6'], ['9', 'C#6'], [']', 'D6'], ['0', 'D#6'], ['\\', 'E6'],
]);
const NOTE_KEY_LABELS = new Map([...KEYBOARD_MAP].map(([key, note]) => [note, key.toUpperCase()]));

const SONGS = [
  {
    id: 'star', title: '小星星', en: 'Twinkle Twinkle Little Star', bpm: 96,
    bars: [
      [['1', 'C4'], ['1', 'C4'], ['5', 'G4'], ['5', 'G4']],
      [['6', 'A4'], ['6', 'A4'], ['5', 'G4', 2]],
      [['4', 'F4'], ['4', 'F4'], ['3', 'E4'], ['3', 'E4']],
      [['2', 'D4'], ['2', 'D4'], ['1', 'C4', 2]],
      [['4', 'F4'], ['4', 'F4'], ['3', 'E4'], ['3', 'E4']],
      [['2', 'D4'], ['2', 'D4'], ['1', 'C4', 2]],
      [['5', 'G4'], ['5', 'G4'], ['4', 'F4'], ['4', 'F4']],
      [['3', 'E4'], ['3', 'E4'], ['2', 'D4', 2]],
      [['5', 'G4'], ['5', 'G4'], ['4', 'F4'], ['4', 'F4']],
      [['3', 'E4'], ['3', 'E4'], ['2', 'D4', 2]],
      [['1', 'C4'], ['1', 'C4'], ['5', 'G4'], ['5', 'G4']],
      [['6', 'A4'], ['6', 'A4'], ['5', 'G4', 2]],
    ],
  },
  {
    id: 'ode', title: '欢乐颂', en: 'Ode to Joy', bpm: 104,
    bars: [
      [['3', 'E4'], ['3', 'E4'], ['4', 'F4'], ['5', 'G4']],
      [['5', 'G4'], ['4', 'F4'], ['3', 'E4'], ['2', 'D4']],
      [['1', 'C4'], ['1', 'C4'], ['2', 'D4'], ['3', 'E4']],
      [['3', 'E4', 2], ['2', 'D4', 2]],
      [['3', 'E4'], ['3', 'E4'], ['4', 'F4'], ['5', 'G4']],
      [['5', 'G4'], ['4', 'F4'], ['3', 'E4'], ['2', 'D4']],
      [['1', 'C4'], ['1', 'C4'], ['2', 'D4'], ['3', 'E4']],
      [['3', 'E4', 2], ['2', 'D4', 2]],
      [['2', 'D4'], ['2', 'D4'], ['3', 'E4'], ['4', 'F4']],
      [['4', 'F4', 2], ['3', 'E4', 2]],
      [['3', 'E4'], ['3', 'E4'], ['2', 'D4'], ['1', 'C4']],
      [['1', 'C4', 4]],
    ],
  },
  {
    id: 'scale', title: '上行音阶', en: 'C Major Scale', bpm: 112,
    bars: [
      [['1', 'C4'], ['2', 'D4'], ['3', 'E4'], ['4', 'F4']],
      [['5', 'G4'], ['6', 'A4'], ['7', 'B4'], ['1', 'C5', 2]],
      [['1', 'C5'], ['7', 'B4'], ['6', 'A4'], ['5', 'G4']],
      [['4', 'F4'], ['3', 'E4'], ['2', 'D4'], ['1', 'C4', 2]],
      [['1', 'C4'], ['2', 'D4'], ['3', 'E4'], ['4', 'F4']],
      [['5', 'G4'], ['6', 'A4'], ['7', 'B4'], ['1', 'C5', 2]],
      [['1', 'C5'], ['7', 'B4'], ['6', 'A4'], ['5', 'G4']],
      [['4', 'F4'], ['3', 'E4'], ['2', 'D4'], ['1', 'C4', 2]],
      [['1', 'C4'], ['2', 'D4'], ['3', 'E4'], ['4', 'F4']],
      [['5', 'G4'], ['6', 'A4'], ['7', 'B4'], ['1', 'C5', 2]],
      [['1', 'C5'], ['7', 'B4'], ['6', 'A4'], ['5', 'G4']],
      [['4', 'F4'], ['3', 'E4'], ['2', 'D4'], ['1', 'C4', 2]],
    ],
  },
];

const BUNDLED_SONG_SOURCES = [
  { url: new URL('../../assets/piano/小霞-向云端.json', import.meta.url), artist: '小霞' },
  { url: new URL('../../assets/piano/韩小欠-苹果香.json', import.meta.url), artist: '韩小欠' },
  { url: new URL('../../assets/piano/齐旦布-游牧时光.json', import.meta.url), artist: '齐旦布' },
];

const KEY_PITCHES = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const SCALE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function bundledNote(tone, octave, key, accidentalMode) {
  if (!tone) return null;
  const tonic = KEY_PITCHES[key] ?? 0;
  let midi = 60 + tonic + SCALE_OFFSETS[Math.max(1, Math.min(7, tone)) - 1] + (octave || 0) * 12;
  if (accidentalMode === 1) midi += 1;
  if (accidentalMode === 2) midi -= 1;
  if (accidentalMode === 3) midi = 60 + tone - 1 + (octave || 0) * 12;
  const pitch = ((midi % 12) + 12) % 12;
  return `${NOTE_NAMES[pitch]}${Math.floor(midi / 12) - 1}`;
}

function bundledLabel(note) {
  if (!note.tone) return '0';
  const accidental = note.accidentalMode === 1 ? '#' : note.accidentalMode === 2 ? 'b' : '';
  return `${accidental}${note.tone}`;
}

function normalizeBundledSong(data, artist) {
  const track = data.tracks?.find(item => item.trackType === 'jp') || data.tracks?.[0];
  const bars = [];
  let bar = [];
  for (const voice of track?.voices || []) {
    if (voice.type === 'barLine') {
      if (bar.length) bars.push(bar);
      bar = [];
      continue;
    }
    if (voice.type !== 'beat' || !voice.notes?.length) continue;
    const beats = Math.max(0.125, 4 / (Number(voice.duration) || 4)) * (voice.dot ? 1.5 : 1);
    const repeat = Math.max(1, Number(voice.beatCount) || 1);
    for (let i = 0; i < repeat; i++) {
      const note = voice.notes[0];
      bar.push([bundledLabel(note), bundledNote(note.tone, note.octave, data.key, note.accidentalMode), beats]);
    }
  }
  if (bar.length) bars.push(bar);
  return {
    id: `bundled-${artist}`,
    title: data.title || artist,
    en: artist,
    bpm: Math.max(40, Math.round(Number(data.tempo) || 80)),
    bars,
  };
}

const frequency = note => {
  const match = /^([A-G])(#?)(\d)$/.exec(note);
  if (!match) return 440;
  const semitone = ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 })[match[1]] + (match[2] ? 1 : 0);
  const midi = (Number(match[3]) + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
};

export function createPiano(body) {
  const root = body.querySelector('[data-piano-app]');
  if (!root) return () => {};

  root.innerHTML = `
    <div class="piano-toolbar">
      <label class="piano-select-label">曲谱
        <select data-piano-song aria-label="选择曲谱"></select>
      </label>
      <button class="piano-button practice" type="button" data-piano-practice aria-pressed="false">练习模式</button>
      <button class="piano-button" type="button" data-piano-play>播放</button>
      <button class="piano-button secondary" type="button" data-piano-stop>停止</button>
    </div>
    <div class="piano-meta"><span data-piano-title></span><span data-piano-tempo></span></div>
    <div class="piano-score" data-piano-score aria-label="简谱"></div>
    <div class="piano-keyboard" data-piano-keyboard aria-label="钢琴键盘"></div>
    <p class="piano-practice-status" data-piano-practice-status aria-live="polite"></p>
    <p class="piano-help">点击琴键演奏，电脑端可按琴键上方提示的按键。</p>
  `;

  const select = root.querySelector('[data-piano-song]');
  const playButton = root.querySelector('[data-piano-play]');
  const practiceButton = root.querySelector('[data-piano-practice]');
  const stopButton = root.querySelector('[data-piano-stop]');
  const titleEl = root.querySelector('[data-piano-title]');
  const tempoEl = root.querySelector('[data-piano-tempo]');
  const scoreEl = root.querySelector('[data-piano-score]');
  const keyboardEl = root.querySelector('[data-piano-keyboard]');
  const practiceStatusEl = root.querySelector('[data-piano-practice-status]');
  const keyEls = new Map();
  const activeCounts = new Map();
  const voices = new Set();
  const timers = new Set();
  const pressed = new Set();
  let audio = null;
  let songs = SONGS;
  let selected = songs[0];
  let playing = false;
  let playIndex = -1;
  let playRun = 0;
  let practiceMode = false;
  let practiceIndex = 0;

  const renderSongOptions = () => {
    select.replaceChildren();
    for (const song of songs) {
      const option = document.createElement('option');
      option.value = song.id;
      option.textContent = `${song.title} / ${song.en}`;
      select.append(option);
    }
    select.value = selected.id;
  };

  const keyElement = (item, kind) => {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = `piano-key ${kind}`;
    key.dataset.note = item.note;
    key.setAttribute('aria-label', `${item.note} ${item.jian}`);
    key.title = `${item.note} · ${item.jian}`;
    const label = document.createElement('span');
    label.textContent = item.jian;
    key.append(label);
    const shortcut = NOTE_KEY_LABELS.get(item.note);
    if (shortcut) {
      const shortcutLabel = document.createElement('small');
      shortcutLabel.className = 'piano-key-shortcut';
      shortcutLabel.textContent = shortcut;
      shortcutLabel.setAttribute('aria-hidden', 'true');
      key.append(shortcutLabel);
    }
    keyboardEl.append(key);
    keyEls.set(item.note, key);
    return key;
  };
  WHITE_KEYS.forEach(item => keyElement(item, 'white'));
  BLACK_KEYS.forEach(item => {
    const key = keyElement(item, 'black');
    key.style.left = `${((item.after + 1) / WHITE_KEYS.length) * 100}%`;
  });

  const setActive = (note, active) => {
    const count = Math.max(0, (activeCounts.get(note) || 0) + (active ? 1 : -1));
    activeCounts.set(note, count);
    keyEls.get(note)?.classList.toggle('active', count > 0);
  };

  const getAudio = async () => {
    if (!audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audio = new AudioContext();
    }
    if (audio.state === 'suspended') await audio.resume();
    return audio;
  };

  const startVoice = async note => {
    if (!note) return null;
    const context = await getAudio();
    if (!context) return null;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency(note);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    const voice = { oscillator, gain, released: false, note };
    voices.add(voice);
    setActive(note, true);
    return voice;
  };

  const stopVoice = voice => {
    if (!voice || voice.released) return;
    voice.released = true;
    const now = audio?.currentTime || 0;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0.0001, now, 0.045);
    voice.oscillator.stop(now + 0.18);
    voices.delete(voice);
    setActive(voice.note, false);
  };

  const playNote = note => {
    const voicePromise = startVoice(note);
    voicePromise?.then(voice => {
      if (!voice) return;
      const timer = setTimeout(() => { timers.delete(timer); stopVoice(voice); }, 520);
      timers.add(timer);
    });
  };

  const scoreLines = () => {
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    const available = Math.max(240, (scoreEl.clientWidth || (mobile ? window.innerWidth - 52 : window.innerWidth - 100)) - (mobile ? 12 : 32));
    const noteWidth = mobile ? 22 : 30;
    const noteGap = mobile ? 2 : 5;
    const lines = [];
    let line = [];
    let lineWidth = 0;
    for (const bar of selected.bars) {
      const noteCount = Math.max(1, bar.length);
      const width = Math.max(42, noteCount * noteWidth + (noteCount - 1) * noteGap + 18);
      if (line.length && lineWidth + width > available) {
        lines.push(line);
        line = [];
        lineWidth = 0;
      }
      line.push(bar);
      lineWidth += width;
    }
    if (line.length) lines.push(line);
    while (lines.length < 3) lines.push([]);
    return lines;
  };

  const renderScore = () => {
    titleEl.textContent = `${selected.title} / ${selected.en}`;
    tempoEl.textContent = `${selected.bpm} BPM`;
    scoreEl.replaceChildren();
    let index = 0;
    for (const bars of scoreLines()) {
      const line = document.createElement('div');
      line.className = 'piano-score-line';
      bars.forEach((bar, barIndex) => {
        const measure = document.createElement('div');
        measure.className = 'piano-measure';
        measure.dataset.count = String(bar.length);
        measure.style.flexGrow = String(Math.max(1, bar.length));
        for (const [jian, note, beats = 1] of bar) {
          const item = document.createElement('span');
          item.className = 'piano-note';
          item.dataset.index = index++;
          item.dataset.note = note || '';
          item.textContent = jian;
          if (beats > 1) item.classList.add('long');
          const cursor = document.createElement('i');
          cursor.className = 'piano-cursor';
          cursor.setAttribute('aria-hidden', 'true');
          item.append(cursor);
          measure.append(item);
        }
        line.append(measure);
        if (barIndex < bars.length - 1) {
          const divider = document.createElement('span');
          divider.className = 'piano-divider';
          divider.textContent = '|';
          line.append(divider);
        }
      });
      scoreEl.append(line);
    }
    highlightScore(practiceMode ? practiceIndex : playing ? Math.max(0, playIndex - 1) : 0);
  };

  const flatten = () => selected.bars.flatMap(bar => bar.map(([jian, note, beats = 1]) => ({ jian, note, beats })));
  const highlightScore = index => {
    const notes = scoreEl.querySelectorAll('.piano-note');
    notes.forEach((el, i) => {
      el.classList.toggle('active', i === index);
      el.classList.toggle('cursor', i === index);
    });
    if (index >= 0) notes[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  const syncPracticeTarget = () => {
    const notes = flatten();
    while (practiceIndex < notes.length && !notes[practiceIndex].note) practiceIndex++;
    keyEls.forEach(key => key.classList.remove('practice-target'));
    if (practiceIndex >= notes.length) {
      highlightScore(-1);
      practiceStatusEl.textContent = '练习完成';
      return;
    }
    const target = notes[practiceIndex];
    keyEls.get(target.note)?.classList.add('practice-target');
    highlightScore(practiceIndex);
    practiceStatusEl.textContent = `请按 ${target.jian}，当前音符 ${target.note}`;
  };

  const checkPracticeNote = note => {
    if (!practiceMode) return;
    const notes = flatten();
    while (practiceIndex < notes.length && !notes[practiceIndex].note) practiceIndex++;
    if (practiceIndex >= notes.length) return;
    if (notes[practiceIndex].note !== note) {
      practiceStatusEl.textContent = `再试一次：请按 ${notes[practiceIndex].jian}`;
      return;
    }
    practiceIndex++;
    syncPracticeTarget();
  };

  const stopSong = () => {
    playRun++;
    playing = false;
    playIndex = -1;
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    voices.forEach(stopVoice);
    highlightScore(practiceMode ? practiceIndex : 0);
    playButton.textContent = '播放';
  };

  const advanceSong = run => {
    if (!playing || run !== playRun) return;
    const notes = flatten();
    if (playIndex >= notes.length) { stopSong(); return; }
    const index = playIndex++;
    const item = notes[index];
    const duration = (60000 / selected.bpm) * item.beats;
    highlightScore(index);
    startVoice(item.note).then(voice => {
      if (!voice) return;
      if (!playing || run !== playRun) { stopVoice(voice); return; }
      const release = setTimeout(() => { timers.delete(release); stopVoice(voice); }, Math.max(120, duration * 0.86));
      timers.add(release);
    });
    const next = setTimeout(() => { timers.delete(next); advanceSong(run); }, duration);
    timers.add(next);
  };

  const playSong = () => {
    if (practiceMode) return;
    stopSong();
    playing = true;
    playIndex = 0;
    playButton.textContent = '暂停';
    advanceSong(playRun);
  };

  const onSelect = () => {
    stopSong();
    selected = songs.find(song => song.id === select.value) || songs[0];
    practiceIndex = 0;
    renderScore();
    if (practiceMode) syncPracticeTarget();
  };
  const onPlay = () => playing ? stopSong() : playSong();
  const onStop = () => stopSong();
  const onPractice = () => {
    if (practiceMode) {
      practiceMode = false;
      practiceIndex = 0;
      practiceButton.setAttribute('aria-pressed', 'false');
      practiceButton.textContent = '练习模式';
      playButton.disabled = false;
      practiceStatusEl.textContent = '';
      keyEls.forEach(key => key.classList.remove('practice-target'));
      stopSong();
      return;
    }
    stopSong();
    practiceMode = true;
    practiceIndex = 0;
    practiceButton.setAttribute('aria-pressed', 'true');
    practiceButton.textContent = '退出练习';
    playButton.disabled = true;
    syncPracticeTarget();
  };
  const onKeyDown = event => {
    if (event.target.closest('input, select, textarea')) return;
    const note = KEYBOARD_MAP.get(event.key.toLowerCase());
    if (!note || event.repeat || pressed.has(note)) return;
    pressed.add(note);
    event.preventDefault();
    playNote(note);
    checkPracticeNote(note);
  };
  const onKeyUp = event => {
    const note = KEYBOARD_MAP.get(event.key.toLowerCase());
    if (note) pressed.delete(note);
  };

  for (const key of keyboardEl.querySelectorAll('.piano-key')) {
    const note = key.dataset.note;
    let voice = null;
    let held = false;
    key.addEventListener('pointerdown', event => {
      event.preventDefault();
      held = true;
      key.setPointerCapture?.(event.pointerId);
      checkPracticeNote(note);
      startVoice(note).then(value => {
        voice = value;
        if (!held) { stopVoice(voice); voice = null; }
      });
    });
    const release = () => { held = false; stopVoice(voice); voice = null; };
    key.addEventListener('pointerup', release);
    key.addEventListener('pointercancel', release);
    key.addEventListener('pointerleave', release);
  }
  select.addEventListener('change', onSelect);
  playButton.addEventListener('click', onPlay);
  practiceButton.addEventListener('click', onPractice);
  stopButton.addEventListener('click', onStop);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  let lastScoreWidth = 0;
  const onResize = () => {
    if (!scoreEl.isConnected || !scoreEl.clientWidth || scoreEl.clientWidth === lastScoreWidth) return;
    lastScoreWidth = scoreEl.clientWidth;
    renderScore();
  };
  window.addEventListener('resize', onResize);
  renderSongOptions();
  renderScore();
  requestAnimationFrame(onResize);

  void Promise.all(BUNDLED_SONG_SOURCES.map(async source => {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`Unable to load ${source.url}`);
    return normalizeBundledSong(await response.json(), source.artist);
  })).then(loaded => {
    if (!loaded.length || !loaded.some(song => song.bars.length)) return;
    stopSong();
    songs = loaded;
    selected = songs[0];
    practiceIndex = 0;
    renderSongOptions();
    renderScore();
    if (practiceMode) syncPracticeTarget();
  }).catch(() => {
    // The small fallback songs keep the piano usable if a static asset is missing.
  });

  return () => {
    stopSong();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);
    practiceButton.removeEventListener('click', onPractice);
    voices.forEach(stopVoice);
    if (audio) { void audio.close(); audio = null; }
  };
}
