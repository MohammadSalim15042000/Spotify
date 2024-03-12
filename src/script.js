let songs;
let currFolder;
let currentsong = new Audio();
let currentSrc;
let currentVolume;
let circle = document.querySelector(".circle");
let play = document.getElementById("play");
let next = document.getElementById("next");
let songInfo = document.querySelector(".songInfo");




// Functions that will convert duration into minutes/seconds Format 
function convertTimeToMinutesAndSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Adding leading zeros if needed
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}



//Function to fetch the songs from the directory or we can say from the folder 
async function getSongs(folder) {
  currFolder = folder;
  const a = await fetch(`http://127.0.0.1:5500/playlists/${currFolder}/`);
  const response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let items = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < items.length; index++) {
    const element = items[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${currFolder}`)[1]);
    }
  }


  //display songs name in music player
  songInfo.innerHTML = songs[0].replaceAll("%20", " ");



  //  show all the songs in the library
  let displayList = document.querySelector(".songList");
  displayList.innerHTML = "";
  for (const song of songs) {
    console.log();

    displayList.innerHTML =
      displayList.innerHTML +
      ` <li class="box">
        <i class="fa-solid fa-music"></i>
        <p class="song_id"> ${song.replaceAll("%20", " ")} </p>
        <div class="together">
        <h6>Play Now</h6>
        <i class="fa-solid fa-circle-play"></i>
        </div>
    </li>`;

    // add event listner to each song
    Array.from(document.querySelectorAll(".box")).forEach((e) => {
      e.addEventListener("click", (element) => {
        playmusic(e.querySelector(".song_id").innerHTML.trim());

        // changings songs info
        play.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        songInfo.innerHTML = e.querySelector(".song_id").innerHTML.trim();
      });
    });
  }

  return songs;
}



//Function to Play the Current Song
function playmusic(track, pause = false) {
  currentsong.src = `http://127.0.0.1:5500/playlists${currFolder}` + track;
  currentSrc = currentsong.src;
  if (!pause) {
    currentsong.play();
  }
}




// Function to display the album cards dynamically 
async function displayAlbums() {
  const a = await fetch(`http://127.0.0.1:5500/playlists/`);
  const response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  for (let anchor of anchors) {
    if (anchor.href.includes("/playlists/")) {
      let folder = anchor.href.split("/").slice(-1);
      const a = await fetch(
        `http://127.0.0.1:5500/playlists/${folder}/info.json`
      );
      const response = await a.json();
      Array.from(document.getElementsByClassName("cards")).forEach((card) => {
        card.innerHTML =
          card.innerHTML +
          `
    <div data-folder=${folder} class="card">
    <div class="img">
        <img src="./playlists/${folder}/cover.jpg" alt="">
        <h2 class="positioning">${response.title}</h2>
        <button class="position-2"><i class="fa-solid fa-play"></i></button>
    </div>
    <div class="details">
        <div class="detail">
            <h3>${response.title}</h3>
           
        </div>
        <p>${response.description}</p>
    
    </div>
</div>
    `;




        // load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach((e) => {
          e.addEventListener("click", async (item) => {
            songs = await getSongs(`/${item.currentTarget.dataset.folder}/`);
          });
        });
      });
    }
  }
}

async function main() {
  let songItems = await getSongs("/atifaslam/");
  playmusic(songs[0], true);

  //display all albums

  displayAlbums();

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();

      play.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    } else {
      currentsong.pause();
      play.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }
  });

  let currentTime = document.querySelector(".currentTime");
  let duration = document.querySelector(".duration");

  currentsong.addEventListener("timeupdate", () => {
    circle.style.position = "absolute";
    circle.style.left = `${
      (currentsong.currentTime / currentsong.duration) * 100
    }%`;

    currentTime.innerHTML = convertTimeToMinutesAndSeconds(
      Math.trunc(currentsong.currentTime)
    );
    duration.innerHTML = convertTimeToMinutesAndSeconds(
      Math.trunc(currentsong.duration)
    );
  });

  document.querySelector(".soundbar").addEventListener("click", (e) => {
    let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    circle.style.left = percentage + "%";
    currentsong.currentTime = (currentsong.duration * percentage) / 100;
  });



  let left;

  document.querySelector(".hamburger").addEventListener("click", (e) => {
    // console.log("clicked")
    left = document.querySelector(".left");
    left.classList.add("toggle");
  });

  document.querySelector(".cross").addEventListener("click", () => {
    left.classList.remove("toggle");
    left.style.transition = "1s";
  });
}

document.querySelector("#previous").addEventListener("click", () => {
  console.log();

  let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
  if (index - 1 >= 0) {
    play.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    playmusic(songs[index - 1]);
    songInfo.innerHTML = songs[index - 1];
  }
});


document.querySelector("#next").addEventListener("click", () => {
  let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

  if (index + 1 < songs.length) {
    play.innerHTML = `<i class="fa-solid fa-pause"></i>`;

    playmusic(songs[index + 1]);
    songInfo.innerHTML = songs[index + 1];
  }
});

document
  .querySelector(".volume")
  .getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
    currentVolume = parseInt(e.target.value) / 100;
    currentsong.volume = currentVolume;
  });

document.querySelector(".volumeImg").addEventListener("click", (e) => {
 
  if(e.target.src.includes("volume.svg")){
    e.target.src = e.target.src.replace("volume.svg", "mute.svg")
    currentsong.volume = 0
  }else{
    e.target.src = e.target.src.replace("mute.svg", "volume.svg")
    currentsong.volume = currentVolume
  }

});

main();
