const tracks = [
  { file: "music/01.mp3", title: "Swag", artist: "Miyauchi" },
  { file: "music/02.m4a", title: "Mi Chico", artist: "DJ Goja" },
  { file: "music/03.mp3", title: "Dancer in the Dark", artist: "Marc Philippe" },
  { file: "music/04.mp3", title: "Fantasy", artist: "Housenick" },
];

const audio = document.getElementById("audio");
const disc = document.getElementById("disc");
const tonearm = document.getElementById("tonearm");
const npTitle = document.getElementById("npTitle");
const npArtist = document.getElementById("npArtist");
const tracklistEl = document.getElementById("tracklist");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const seek = document.getElementById("seek");
const curTimeEl = document.getElementById("curTime");
const durTimeEl = document.getElementById("durTime");

const ICON_PLAY = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
const ICON_PAUSE = '<path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/>';

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0: off, 1: repeat all, 2: repeat one
let isSeeking = false;

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function renderTracklist() {
  tracklistEl.innerHTML = "";
  tracks.forEach((track, i) => {
    const row = document.createElement("div");
    row.className = "track" + (i === currentIndex ? " active" : "");
    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");

    const marker = (i === currentIndex && isPlaying)
      ? `<div class="track-eq"><span></span><span></span><span></span></div>`
      : `<div class="track-index">${i + 1}</div>`;

    row.innerHTML = `
      ${marker}
      <div class="track-info">
        <div class="track-title">${track.title}</div>
        <div class="track-artist">${track.artist}</div>
      </div>
    `;

    row.addEventListener("click", () => loadTrack(i, true));
    tracklistEl.appendChild(row);
  });
}

function loadTrack(index, autoplay) {
  currentIndex = index;
  const track = tracks[currentIndex];
  audio.src = track.file;
  npTitle.textContent = track.title;
  npArtist.textContent = track.artist;
  seek.value = 0;
  curTimeEl.textContent = "0:00";
  durTimeEl.textContent = "0:00";
  renderTracklist();
  if (autoplay) play();
}

function play() {
  audio.play().catch(() => {});
  isPlaying = true;
  disc.classList.add("spinning");
  tonearm.classList.add("dropped");
  playIcon.innerHTML = ICON_PAUSE;
  renderTracklist();
}

function pause() {
  audio.pause();
  isPlaying = false;
  disc.classList.remove("spinning");
  tonearm.classList.remove("dropped");
  playIcon.innerHTML = ICON_PLAY;
  renderTracklist();
}

function togglePlay() {
  if (isPlaying) pause(); else play();
}

function nextTrack() {
  let nextIndex;
  if (isShuffle) {
    if (tracks.length === 1) nextIndex = 0;
    else {
      do { nextIndex = Math.floor(Math.random() * tracks.length); }
      while (nextIndex === currentIndex);
    }
  } else {
    nextIndex = (currentIndex + 1) % tracks.length;
  }
  loadTrack(nextIndex, true);
}

function prevTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(prevIndex, true);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("on", isShuffle);
}

function cycleRepeat() {
  repeatMode = (repeatMode + 1) % 3;
  repeatBtn.classList.toggle("on", repeatMode !== 0);
  repeatBtn.style.opacity = repeatMode === 2 ? "1" : "";
  repeatBtn.title = repeatMode === 0 ? "تکرار: خاموش" : repeatMode === 1 ? "تکرار: همه" : "تکرار: یک آهنگ";
}

audio.addEventListener("loadedmetadata", () => {
  durTimeEl.textContent = formatTime(audio.duration);
  seek.max = audio.duration || 0;
});

audio.addEventListener("timeupdate", () => {
  if (isSeeking) return;
  curTimeEl.textContent = formatTime(audio.currentTime);
  seek.value = audio.currentTime;
});

audio.addEventListener("ended", () => {
  if (repeatMode === 2) {
    audio.currentTime = 0;
    play();
  } else if (repeatMode === 1 || isShuffle) {
    nextTrack();
  } else if (currentIndex < tracks.length - 1) {
    nextTrack();
  } else {
    pause();
  }
});

seek.addEventListener("input", () => { isSeeking = true; });
seek.addEventListener("change", () => {
  audio.currentTime = parseFloat(seek.value);
  isSeeking = false;
});

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);
shuffleBtn.addEventListener("click", toggleShuffle);
repeatBtn.addEventListener("click", cycleRepeat);

// init
loadTrack(0, false);
