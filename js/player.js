// ============= EisenHerz player =============
(function () {
  const TRACKS = [
    { de: "Die Fahne hoch!", jp: "旗を高く掲げよ", file: "audio/01.mp3", seconds: 270 },
    { de: "Die Hitlerleute", jp: "ヒトラー者", file: "audio/02.mp3", seconds: 212 },
    { de: "Das Hakenkreuzlied", jp: "鍵十字の歌", file: "audio/03.mp3", seconds: 208 },
    { de: "Die Braune Kompanie", jp: "褐色の中隊", file: "audio/04.mp3", seconds: 169 },
    { de: "Volk Ans Gewehr", jp: "民族よ武器を", file: "audio/05.mp3", seconds: 178 },
    { de: "Jugend Trauert", jp: "ユーゲントが哀悼する", file: "audio/06.mp3", seconds: 208 },
    { de: "Jugend Marschiertr", jp: "ユーゲントは行進する", file: "audio/07.mp3", seconds: 189 },
    { de: "Gute Nacht, Mutter", jp: "おやすみなさい、お母さん", file: "audio/08.mp3", seconds: 227 },
    { de: "SS marschiert in Feindesland", jp: "親衛隊は敵地を進む", file: "audio/09.mp3", seconds: 117 },
    { de: "Lili Marleen", jp: "リリー・マルレーン", file: "audio/10.mp3", seconds: 194 },
  ];

  const DEFAULT_VOLUME = 0.7;
  const SEEK_STEP_SECONDS = 5;
  const VOLUME_STEP = 0.05;
  const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [role='button'], [role='slider'], [contenteditable='true']";

  const $ = (id) => document.getElementById(id);
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const formatTime = (seconds) => {
    const wholeSeconds = Math.max(0, Math.floor(seconds));
    return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
  };
  const toRoman = (number) => {
    const numerals = [["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]];
    let result = "";

    for (const [symbol, value] of numerals) {
      while (number >= value) {
        result += symbol;
        number -= value;
      }
    }
    return result;
  };

  const elements = {
    tracklist: $("tracklist"),
    bar: $("p-bar"),
    thumb: $("p-thumb"),
    progress: $("p-prog"),
    currentTime: $("p-cur"),
    duration: $("p-dur"),
    title: $("p-de"),
    subtitle: $("p-jp"),
    jacket: $("p-jacket"),
    play: $("p-play"),
    previous: $("p-prev"),
    next: $("p-next"),
    volume: $("p-vol"),
    volumeFill: $("p-vfill"),
  };

  const audio = new Audio();
  audio.preload = "metadata";

  let currentIndex = 0;
  let trackElements = [];

  function playAudio() {
    const playRequest = audio.play();
    if (playRequest) playRequest.catch(updateTrackUI);
  }

  function setProgress(ratio) {
    const percent = clamp(ratio) * 100;
    elements.bar.style.width = `${percent}%`;
    elements.thumb.style.left = `${percent}%`;
    elements.progress.setAttribute("aria-valuenow", String(Math.round(percent)));
  }

  function setVolume(volume) {
    audio.volume = clamp(volume);
    const percent = audio.volume * 100;
    elements.volumeFill.style.width = `${percent}%`;
    elements.volume.setAttribute("aria-valuenow", String(Math.round(percent)));
  }

  function loadTrack(index) {
    currentIndex = (index + TRACKS.length) % TRACKS.length;
    const track = TRACKS[currentIndex];

    audio.src = track.file;
    elements.title.textContent = track.de;
    elements.subtitle.textContent = track.jp;
    elements.jacket.src = "img/cover1.webp";
    elements.duration.textContent = formatTime(track.seconds);
    elements.currentTime.textContent = "0:00";
    setProgress(0);
    updateTrackUI();
  }

  function togglePlayback() {
    if (audio.paused) playAudio();
    else audio.pause();
  }

  function selectTrack(index) {
    if (index === currentIndex && !audio.paused) {
      audio.pause();
      return;
    }
    loadTrack(index);
    playAudio();
  }

  function updateTrackUI() {
    const playing = !audio.paused;
    elements.play.textContent = playing ? "| |" : "▶";
    elements.play.setAttribute("aria-label", playing ? "一時停止" : "再生");

    trackElements.forEach((element, index) => {
      const isPlaying = index === currentIndex && playing;
      element.classList.toggle("playing", isPlaying);
      element.setAttribute("aria-pressed", String(isPlaying));
      element.querySelector(".cta").textContent = isPlaying ? "playing" : "play";
    });
  }

  function renderTracklist() {
    const fragment = document.createDocumentFragment();

    TRACKS.forEach((track, index) => {
      const item = document.createElement("li");
      item.className = "trk";
      item.dataset.idx = index;
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-pressed", "false");
      item.innerHTML = `
        <div class="n">${toRoman(index + 1)}</div>
        <div class="title">
          <div class="de">${track.de}</div>
          <div class="jp-sub">${track.jp}</div>
        </div>
        <div class="dur">${formatTime(track.seconds)}</div>
        <div class="cta">play</div>
      `;
      item.addEventListener("click", () => selectTrack(index));
      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        selectTrack(index);
      });
      fragment.appendChild(item);
    });

    elements.tracklist.appendChild(fragment);
    trackElements = [...elements.tracklist.querySelectorAll(".trk")];
  }

  function pointerRatio(event, element) {
    return clamp((event.clientX - element.getBoundingClientRect().left) / element.offsetWidth);
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    elements.currentTime.textContent = formatTime(audio.currentTime);
    setProgress(audio.currentTime / audio.duration);
  });

  audio.addEventListener("ended", () => {
    loadTrack(currentIndex + 1);
    playAudio();
  });
  audio.addEventListener("play", updateTrackUI);
  audio.addEventListener("pause", updateTrackUI);

  elements.play.addEventListener("click", togglePlayback);
  elements.previous.addEventListener("click", () => {
    loadTrack(currentIndex - 1);
    playAudio();
  });
  elements.next.addEventListener("click", () => {
    loadTrack(currentIndex + 1);
    playAudio();
  });

  elements.progress.addEventListener("click", (event) => {
    if (audio.duration) audio.currentTime = pointerRatio(event, elements.progress) * audio.duration;
  });
  elements.progress.addEventListener("keydown", (event) => {
    if (!audio.duration || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    if (event.key === "Home") audio.currentTime = 0;
    else if (event.key === "End") audio.currentTime = audio.duration;
    else {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      audio.currentTime = clamp(audio.currentTime + direction * SEEK_STEP_SECONDS, 0, audio.duration);
    }
  });

  elements.volume.addEventListener("click", (event) => {
    setVolume(pointerRatio(event, elements.volume));
  });
  elements.volume.addEventListener("keydown", (event) => {
    const volumeKeys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!volumeKeys.includes(event.key)) return;
    event.preventDefault();

    if (event.key === "Home") setVolume(0);
    else if (event.key === "End") setVolume(1);
    else {
      const increase = event.key === "ArrowRight" || event.key === "ArrowUp";
      setVolume(audio.volume + (increase ? VOLUME_STEP : -VOLUME_STEP));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlayback();
    } else if (event.code === "ArrowRight" && event.shiftKey) {
      loadTrack(currentIndex + 1);
      playAudio();
    } else if (event.code === "ArrowLeft" && event.shiftKey) {
      loadTrack(currentIndex - 1);
      playAudio();
    }
  });

  renderTracklist();
  setVolume(DEFAULT_VOLUME);
  loadTrack(0);
})();
