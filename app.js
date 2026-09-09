const cursong = new Audio();

let songs = [];
let songname = [];
let currentSongIndex = 0;

const $ = (selector) => document.querySelector(selector);

const playBtn = $("#play");
const songInfo = $(".song-info");
const songTime = $(".song-time");
const thumb = $(".thumb");
const progress = $(".progress");
const seekbar = $(".seekbar");
const songList = $(".song-list ul");
const songhisList = $(".song-his-list ul");
const volume = $("#volume");
const cardContainer = $(".card-container");

const random = () => {
  return Math.floor(Math.random() * songs.length);
};

let shufflevalue = "non-shuffle";
function shuffle() {
  let a = document.querySelector(".shuffle").getElementsByTagName("img")[0];
  if (shufflevalue === "non-shuffle") {
    shufflevalue = "shuffle";
    a.src = "img/shuffle.svg";
  } else if (shufflevalue === "shuffle") {
    shufflevalue = "repeat";
    a.src = "img/repeatshuffle.svg";
  } else {
    shufflevalue = "non-shuffle";
    a.src = "img/non-shuffle.svg";
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  seconds = Math.floor(seconds);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

function updatePlayButton(isPlaying) {
  playBtn.src = isPlaying ? "img/pause.svg" : "img/play.svg";
}

async function playMusic(index) {
  if (!songs[index]) return;
  currentSongIndex = index;
  cursong.src = songs[index];

  thumb.style.left = "0%";
  progress.style.width = "0%";
  songTime.textContent = "00:00 / 00:00";
  songInfo.textContent = songname[index] || "Unknown";

  try {
    await cursong.play();
    updatePlayButton(true);
  } catch (error) {
    updatePlayButton(false);
  }
}

const playbyhis = (url) => {};

async function getSong(folder) {
  try {
    const response = await fetch(`https://192.168.10.6:3000/song/${folder}/`);

    if (!response.ok) {
      throw new Error(`HTTPS error: ${response.status}`);
    }

    const html = await response.text();

    const div = document.createElement("div");
    div.innerHTML = html;

    const links = div.querySelectorAll("a");

    songs = [];
    songname = [];

    links.forEach((link) => {
      if (link.href.endsWith(".mp3")) {
        songs.push(link.href);
        songname.push(link.textContent.trim());
      }
    });

    renderSongList(songname);

    return songs;
  } catch (error) {
    console.error("Failed to load songs:", error);
    return [];
  }
}

function renderSongList(songs, indexes = null) {
  songList.innerHTML = songs
    .map((song, index) => {
      const actualIndex = indexes ? indexes[index] : index;
      return `
        <li data-index="${actualIndex}">
          <img
            class="invert"
            width="30"
            height="30"
            src="img/musicLogo.svg"
            alt="Play song"
          >
          <div class="info">
            <div>${song}</div>
            <div>Artist Undefined</div>
          </div>
          <div class="play-now">
            <span>Play now</span>
              <img
              class="invert"
              width="30"
              height="30"
              src="img/play.svg"
              alt="Play song"
            >
          </div>
        </li>
      `;
    })
    .join("");
}

let savehis = JSON.parse(localStorage.getItem("savehis")) || [];
function renderSongHisList(p) {
  let index = songname.indexOf(p);
  if (index === -1 || !songs[index]) {
    return;
  }
  let songurl = songs[index];
  let song = songname[index];
  let existingSong = Array.from(songhisList.querySelectorAll("li")).find(
    (li) => li.dataset.url === songurl,
  );

  if (existingSong) {
    existingSong.remove();
  }

  songhisList.insertAdjacentHTML(
    "beforeend",
    `<li data-url="${songurl}">
      <img class="invert"
        width="30"
        height="30"
        src="img/musicLogo.svg"
        alt="Play song"
      >
      <div class="info">
        <div>${song}</div>
        <div>Artist Undefined</div>
      </div>
      <img class="invert delete-his"
        width="24"
        height="20"
        src="img/delete.svg"
        alt="delete icon"
      >
      <div class="his-play-now">
        <img
          class="invert"
          width="30"
          height="30"
          src="img/play.svg"
          alt="Play song"
        >
      </div>
    </li>`,
  );

  let existingHistory = savehis.find((item) => item.url === songurl);

  if (existingHistory) {
    savehis = savehis.filter((item) => item.url !== songurl);
  }

  savehis.unshift({
    name: song,
    url: songurl,
  });
  localStorage.setItem("savehis", JSON.stringify(savehis));
}

if (savehis.length >= 1) {
  savehis.forEach((e) => {
    songhisList.insertAdjacentHTML(
      "afterbegin",
      `<li data-url="${e.url}">
      <img class="invert"
        width="30"
        height="30"
        src="img/musicLogo.svg"
        alt="Play song"
      >
      <div class="info">
        <div>${e.name}</div>
        <div>Artist Undefined</div>
      </div>
      <div class="delete-his">
        <img
          class="invert"
          width="24"
          height="20"
          src="img/delete.svg"
          alt="delete">
      </div>
      <div class="his-play-now">
        <img
          class="invert"
          width="30"
          height="30"
          src="img/play.svg"
          alt="Play song"
        >
      </div></li>`,
    );
  });
}

songList.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;
  const index = Number(item.dataset.index);

  playMusic(index);
});

songhisList.addEventListener("click", (event) => {
  const playButton = event.target.closest(".his-play-now");
  if (!playButton) return;
  const item = playButton.closest("li");
  if (!item) return;
  const url = item.dataset.url;
  const name = item.querySelector(".info").firstElementChild.textContent;
  cursong.src = url;
  cursong.play();
  songInfo.textContent = name || "Unknown";
  updatePlayButton(true);
});

songhisList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-his");
  if (!deleteButton) return;
  const item = deleteButton.closest("li");
  if (!item) return;
  const url = item.dataset.url;
  item.remove();
  savehis = savehis.filter((song) => song.url !== url);
  localStorage.setItem("savehis", JSON.stringify(savehis));
});

async function displayCards() {
  const response = await fetch("https://192.168.10.6:3000/song/");
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  const html = await response.text();
  const div = document.createElement("div");
  div.innerHTML = html;
  const links = [...div.querySelectorAll("a")];

  const folders = links
    .filter((link) => link.href.includes("/%5Csong%5C"))
    .map((link) => {
      const folder = link.href.split("/%5Csong%5C")[1];

      return folder;
    });

  // Fetch all info.json files simultaneously
  const cards = await Promise.all(
    folders.map(async (folder) => {
      const response = await fetch(
        `http://192.168.10.6:3000/song/${folder}info.json`,
      );

      if (!response.ok) {
        throw new Error("Failed to load info");
      }

      const info = await response.json();

      return {
        folder,
        ...info,
      };
    }),
  );

  cardContainer.innerHTML = cards
    .filter(Boolean)
    .map(
      ({ folder, title, descreption }) => `
          <div
            data-folder="${folder.replace("/", "")}"
            class="card"
          >
            <div class="play">
              <div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="black"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 5.5V18.5C8 19.5 9.1 20.1 9.9 19.5L19.2
                    12.9C19.9 12.4 19.9 11.6 19.2 11.1L9.9 4.5
                    C9.1 3.9 8 4.5 8 5.5Z"
                  />
                </svg>
              </div>
            </div>
            <img
              width="180"
              height="180"
              decoding="async"
              fetchpriority= "high"
              src="/song/${folder}cover.jpg"
              alt="${title || "Song cover"}"
            >
            <h2>${title || "Unknown"}</h2>
            <p>${descreption || ""}</p>

          </div>
        `,
    )
    .join("");
}

cardContainer.addEventListener("click", async (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  const folder = card.dataset.folder;
  const newSongs = await getSong(folder);
  if (newSongs.length > 0) {
    currentSongIndex = 0;
    cursong.src = songs[0];
    songInfo.textContent = songname[0] || "Unknown";
    songTime.textContent = "00:00 / 00:00";
  }
  showMessage("Songs is load in Sidebar / album songs");
  localStorage.setItem("folder", JSON.stringify(folder));
  updatePlayButton(false);
});

const play = async () => {
  if (!cursong.src) return;
  if (cursong.paused) {
    try {
      await cursong.play();
      updatePlayButton(true);
    } catch (error) {
      console.error(error);
    }
  } else {
    cursong.pause();
    updatePlayButton(false);
  }
};

cursong.addEventListener("timeupdate", () => {
  const duration = cursong.duration;
  const percentage =
    Number.isFinite(duration) && duration > 0
      ? (cursong.currentTime / duration) * 100
      : 0;
  songTime.textContent = `${formatTime(cursong.currentTime)} / ${formatTime(duration)}`;
  thumb.style.left = `${percentage}%`;
  progress.style.width = `${percentage}%`;
});

seekbar.addEventListener("click", (event) => {
  if (!Number.isFinite(cursong.duration)) return;
  const rect = seekbar.getBoundingClientRect();
  const percentage = ((event.clientX - rect.left) / rect.width) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  cursong.currentTime = (cursong.duration * clampedPercentage) / 100;
});

const previous = () => {
  if (shufflevalue === "non-shuffle") {
    if (currentSongIndex > 0) {
      playMusic(currentSongIndex - 1);
    }
  } else if (shufflevalue === "shuffle") {
    playMusic(random());
  } else {
    playMusic(currentSongIndex);
  }
};

const next = () => {
  if (shufflevalue === "non-shuffle") {
    if (currentSongIndex < songs.length - 1) {
      playMusic(currentSongIndex + 1);
    }
  } else if (shufflevalue === "shuffle") {
    playMusic(random());
  } else {
    playMusic(currentSongIndex);
  }
};

cursong.addEventListener("ended", () => {
  renderSongHisList(songname[currentSongIndex]);
  if (shufflevalue === "non-shuffle") {
    if (currentSongIndex < songs.length - 1) {
      playMusic(currentSongIndex + 1);
    } else {
      updatePlayButton(false);
    }
  } else if (shufflevalue === "shuffle") {
    playMusic(random());
  } else {
    playMusic(currentSongIndex);
  }
});

function updateVolume() {
  const a = document.querySelector(".timevol img");
  if (cursong.muted || cursong.volume === 0) {
    a.src = "img/muted.svg";
  } else if (cursong.volume >= 0.5) {
    a.src = "img/volume.svg";
  } else {
    a.src = "img/lowvolume.svg";
  }
  volume.value = cursong.muted ? 0 : cursong.volume * 100;
}
volume.addEventListener("input", (event) => {
  cursong.volume = Number(event.target.value) / 100;
  updateVolume();
});

async function main() {
  await getSong(JSON.parse(localStorage.getItem("folder")) || "phonk");
  if (songs.length > 0) {
    cursong.src = songs[0];
    songInfo.textContent = songname[0] || "Unknown";
    songTime.textContent = "00:00 / 00:00";
  }

  await displayCards();
}

main();

let asideValue = "hide";
const aside = document.querySelector(".left");
function toggleAside() {
  if (asideValue === "hide") {
    aside.style.left = "0";
    document.querySelector(".hambuger").style.top = "25px";
    document.querySelector(".hambuger").style.right = "25px";
    asideValue = "show";
  } else {
    aside.style.left = "-92vw";
    document.querySelector(".hambuger").style.top = "26px";
    document.querySelector(".hambuger").style.right = "-80px";
    asideValue = "hide";
  }
}

const search = document.querySelector(".search");
const toggleSearch = () => {
  if (search.classList.contains("hide")) {
    search.classList.remove("hide");
    search.classList.add("show");
  } else {
    search.classList.remove("show");
    search.classList.add("hide");
  }
};

let c = document.querySelector("#text");
c.addEventListener("input", () => {
  const searchValue = c.value.trim().toLowerCase();
  if (!searchValue) {
    renderSongList(songname);
    return;
  }
  const matchingSongs = [];
  const matchingIndexes = [];
  songname.forEach((name, index) => {
    if (name.toLowerCase().includes(searchValue)) {
      matchingSongs.push(name);
      matchingIndexes.push(index);
    }
  });
  if (matchingSongs.length === 0) {
    songList.innerHTML = `<li class="no-results">In this album "${searchValue.toUpperCase()}" song is not found.</li>`;
    return;
  }
  renderSongList(matchingSongs, matchingIndexes);
});

let hisval = "hide";
let his = document.getElementsByTagName("article")[0];
const callhis = () => {
  if (hisval === "hide") {
    his.style.top = "0";
    hisval = "show";
  } else {
    his.style.top = "-110vh";
    hisval = "hide";
  }
};

function clearSongHistory() {
  songhisList.innerHTML = "";
  savehis = [];
  localStorage.removeItem("savehis");
}

function showMessage(text, type = "info") {
  const message = document.getElementById("message");
  message.textContent = text;
  message.className = "";
  message.classList.add(type, "show");
  setTimeout(() => {
    message.classList.remove("show");
  }, 3000);
}

document.addEventListener("keydown", (event) => {
  const active = document.activeElement;

  if (
    active &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable)
  ) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    play();
  } else if (event.code === "KeyR") {
    event.preventDefault();
    shuffle();
  } else if (event.ctrlKey && event.key === "ArrowRight") {
    event.preventDefault();
    next();
  } else if (event.ctrlKey && event.key === "ArrowLeft") {
    event.preventDefault();
    previous();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    if (Number.isFinite(cursong.duration)) {
      cursong.currentTime = Math.min(
        cursong.duration,
        cursong.currentTime + 10,
      );
    }
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    cursong.currentTime = Math.max(0, cursong.currentTime - 10);
  } else if (event.code === "KeyM") {
    event.preventDefault();
    cursong.muted = !cursong.muted;
    updateVolume();
  } else if (event.code === "ArrowUp") {
    event.preventDefault();
    cursong.volume = Math.min(1, cursong.volume + 0.1);
    updateVolume();
  } else if (event.code === "ArrowDown") {
    event.preventDefault();
    cursong.volume = Math.max(0, cursong.volume - 0.1);
    updateVolume();
  }
});

let none = "hide";
let sec = $("#login-section")
const togglelogin = () => {
  if (none === "hide") {
    sec.style.left = "50%";
    sec.style.top = "50%";
    none = "show";
  } else {
    sec.style.top = "-50%";
    none = "hide";
  }
};

let form = $("form");
let username = localStorage.getItem("username") || "";
form.addEventListener("submit", e => {
  e.preventDefault();
  let user = document.querySelector("#username-input").value;
  username = user.replace(/[0-9]|gmail|com|[.@]/gi, "").trim();
  if (username === "") {
    return
  }
  showMessage(`Hello   " ${username} "`);
  form.reset();
  localStorage.setItem("username", username);
});

if (username !== "") {
  showMessage(`Hello   " ${username} "`);
}
