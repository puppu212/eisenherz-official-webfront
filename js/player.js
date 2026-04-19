// ============= EisenHerz player =============
(function () {
  const TRACKS = [
    { de: "Die Fahne hoch!",         jp: "旗を高く掲げよ",         file: "audio/01.mp3", seconds: 270 },
    { de: "Die Hitlerleute",        jp: "ヒトラー者",              file: "audio/02.mp3", seconds: 212 },
    { de: "Das Hakenkreuzlied",       jp: "鍵十字の歌",          file: "audio/03.mp3", seconds: 208 },
    { de: "Die Braune Kompanie",         jp: "褐色の中隊",            file: "audio/04.mp3", seconds: 169 },
    { de: "Volk Ans Gewehr",           jp: "民族よ武器を",               file: "audio/05.mp3", seconds: 178 },
    { de: "Jugend Trauert",        jp: "ユーゲントが哀悼する",            file: "audio/06.mp3", seconds: 208 },
    { de: "Jugend Marschiertr", jp: "ユーゲントは行進する",      file: "audio/07.mp3", seconds: 189 },
    { de: "Gute Nacht, Mutter",    jp: "おやすみなさい、お母さん",        file: "audio/08.mp3", seconds: 227 },
    { de: "SS marschiert in Feindesland",          jp: "親衛隊は敵地を進む",                file: "audio/09.mp3", seconds: 117 },
    { de: "Lili Marleen",          jp: "リリー・マルレーン",                file: "audio/10.mp3", seconds: 194 },
  ];

  const fmt = (s) => {
    s = Math.max(0, Math.floor(s));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const toRoman = (n) => {
    const map = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
    let out = "";
    for (const [s, v] of map) { while (n >= v) { out += s; n -= v; } }
    return out;
  };

  // ---- tracklist ----
  const ul = document.getElementById("tracklist");
  TRACKS.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "trk";
    li.dataset.idx = i;
    li.innerHTML = `
      <div class="n">${toRoman(i + 1)}</div>
      <div class="title">
        <div class="de">${t.de}</div>
        <div class="jp-sub">${t.jp}</div>
      </div>
      <div class="dur">${fmt(t.seconds)}</div>
      <div class="cta">play</div>
    `;
    li.addEventListener("click", () => {
      if (i === idx && !audio.paused) { audio.pause(); }
      else { loadTrack(i); audio.play(); }
    });
    ul.appendChild(li);
  });

  // ---- audio element ----
  const audio = new Audio();
  audio.preload = "metadata";

  const $ = (id) => document.getElementById(id);
  const bar = $("p-bar"), thumb = $("p-thumb"), prog = $("p-prog");
  const curEl = $("p-cur"), durEl = $("p-dur");
  const deEl = $("p-de"), jpEl = $("p-jp"), jkt = $("p-jacket");
  const playBtn = $("p-play");
  const vfill = $("p-vfill");
  const topN = document.getElementById("top-n");

  let idx = 0;

  function loadTrack(i) {
    idx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    const t = TRACKS[idx];
    audio.src = t.file;
    deEl.textContent = t.de;
    jpEl.textContent = t.jp;
    jkt.src = `img/cover1.png`;
    durEl.textContent = fmt(t.seconds);
    curEl.textContent = "0:00";
    setBar(0);
    if (topN) topN.textContent = toRoman(idx + 1);
    updateTrackUI();
  }

  function updateTrackUI() {
    const playing = !audio.paused;
    playBtn.innerHTML = playing ? "| |" : "▶";
    document.querySelectorAll(".trk").forEach((el, k) => {
      el.classList.toggle("playing", k === idx && playing);
      const cta = el.querySelector(".cta");
      if (cta) cta.textContent = (k === idx && playing) ? "playing" : "play";
    });
  }

  function setBar(pct) {
    const p = Math.max(0, Math.min(1, pct));
    bar.style.width = (p * 100) + "%";
    thumb.style.left = (p * 100) + "%";
  }

  // ---- audio events ----
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    curEl.textContent = fmt(audio.currentTime);
    setBar(audio.currentTime / audio.duration);
  });

  audio.addEventListener("ended", () => {
    loadTrack(idx + 1);
    audio.play();
  });

  audio.addEventListener("play", updateTrackUI);
  audio.addEventListener("pause", updateTrackUI);

  // ---- controls ----
  playBtn.addEventListener("click", () => {
    if (audio.paused) audio.play(); else audio.pause();
  });
  $("p-prev").addEventListener("click", () => { loadTrack(idx - 1); audio.play(); });
  $("p-next").addEventListener("click", () => { loadTrack(idx + 1); audio.play(); });

  prog.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const pct = (e.clientX - prog.getBoundingClientRect().left) / prog.offsetWidth;
    audio.currentTime = pct * audio.duration;
  });

  $("p-vol").addEventListener("click", (e) => {
    const pct = Math.max(0, Math.min(1, (e.clientX - $("p-vol").getBoundingClientRect().left) / $("p-vol").offsetWidth));
    audio.volume = pct;
    vfill.style.width = (pct * 100) + "%";
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") { e.preventDefault(); if (audio.paused) audio.play(); else audio.pause(); }
    if (e.code === "ArrowRight" && e.shiftKey) { loadTrack(idx + 1); audio.play(); }
    if (e.code === "ArrowLeft"  && e.shiftKey) { loadTrack(idx - 1); audio.play(); }
  });

  loadTrack(0);
})();
