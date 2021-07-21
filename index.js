const play = document.getElementById("play");
const playOrPause = document.getElementById("playOrPause");
/*const volumeMute = document.getElementById("volumeMute");
const volumeUp = document.getElementById("volumeUp");*/
const playSpace = document.getElementById("playingField");
const elevationNode = document.getElementById("elevation");
const recordScore = document.getElementById("recordScore");

function getRecordScore() {
  if (localStorage.getItem("recordScore")) {
    recordScore.textContent = localStorage.getItem("recordScore");
  }
}
getRecordScore();

const playingField = {
  width: 400,
  height: 550,
};
const playerSize = {
  width: 55,
  height: 50,
};
const platformSize = {
  width: 50,
  height: 15,
};
const playerPosition = {
  x: null,
  y: null,
};
const mobSize = {
  width: 55,
  height: 55,
};
const bottomLine = playingField.height;
const playerMovementSpeed = 4;
let player;
let mobAlreadyInSpace = false;
let mobs;
let disableCollisions = false;
let acceleration = 10;
let fallAcceleration = 1;
let jumpAcceleration = playerMovementSpeed;
let cameraMovementAcceleration = 15;
let elevation = 0;
let countPlatforms = 14;
let gravityNormalization = 0;
let changeGravityPlatformCount16 = true;
let changeGravityPlatformCount14 = true;
let changeGravityPlatformCount12 = true;
let changeGravityPlatformCount10 = true;
let changeGravityPlatformCount7 = true;
let changeGravityPlatformCount5 = true;
let platformsArr = [];
/*
let alreadyGhostsPlatformsArr = false;
let ghostsPlatformsArr = [];
*/
let gameIsRunning = false;
let gameOver = true;
let locationInSpaceY = null;
let jumping = true;
let crossing = false;
let deformation = true;

let countSteps = 0;
let countStepsUp = 0;
let randomOneOrZero;

let movementLoop;
let jumpLoop;
let fallDownLoop;
let checkHitboxesLoop;
let mobsHitBoxDownLoop;

/* mobile variables */
let mobile = false;
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  mobile = true;
}
let goRightLoop;
let goLeftLoop;
let goRight = false;
let goLeft = false;
/*mobile variables end */

let cameraMove = false;

let platformRemovalHeight = 50;

play.addEventListener("click", gameLaunch);
playSpace.addEventListener("click", gameLaunch);

class Mobs {
  constructor(width, height, color) {
    this.x = width;
    this.y = height;
    this.color = color;
  }
  createMobs() {
    const setMobsDiv = document.createElement("div");
    setMobsDiv.classList.add("mob", this.color);
    setMobsDiv.style.marginTop = `${this.y}px`;
    setMobsDiv.style.marginLeft = `${this.x}px`;
    return playSpace.appendChild(setMobsDiv);
  }
}
/*
class Platform {
  constructor(width, height) {
    this.x = width;
    this.y = height;
  }
  createPlatform() {
    const setPlatformDiv = document.createElement("div");
    setPlatformDiv.classList.add("platform");
    setPlatformDiv.style.marginTop = `${this.y}px`;
    setPlatformDiv.style.marginLeft = `${this.x}px`;
    return playSpace.appendChild(setPlatformDiv);
  }
}
*/
function Platform(x, y) {
  const setPlatformDiv = document.createElement("div");
  setPlatformDiv.classList.add("platform");
  setPlatformDiv.style.marginTop = `${y}px`;
  setPlatformDiv.style.marginLeft = `${x}px`;
  return playSpace.appendChild(setPlatformDiv);
}
function createPlatforms() {
  for (let i = 0; i < countPlatforms; i++) {
    let heightSpace = 20 + i * (playingField.height / countPlatforms);
    let widthSpace;
    if (i % 2) {
      widthSpace =
        10 +
        i *
          (playingField.width / countPlatforms) *
          0.92 *
          Math.random(); /* первое число влияет на отступ от левого края, итератор позволяет сделать последовательное увеличение смещения для каждого следующего блока, далее в скобках делим ширину игрового поля на количество блоков что-бы вычислить максимально доступное пространство для каждого блока, следующее число (от 0.99 и меньше) уменьшает общий результат (что-бы компенсировать смещение слева), и Math.random() добавляет случайное число, для более случайного распределения блоков по полю. (Если убрать Math.random(), на выходе  получаем распределение от верхнего левого края к нижнему правому).*/
    } else {
      widthSpace =
        playingField.width -
        60 -
        i *
          (playingField.width / countPlatforms) *
          0.92 *
          Math.random(); /* здесь отнимаем от ширины поля 60px, что на 10px меньше ширины блока платформы, это делается что-бы справа был отступ в 10px аналогично верхнему примеру, где отступ от левой части поля в 10px. Далее от получившейся ширины отнимаем число, которое получаем аналогично прошлому условию. (Если убрать Math.random(), на выходе получаем распределение от верхнего правого края к нижнему левому).*/
    } /* для того что-бы равномернее распределить блоки по полю применяем разные условия распределения к четным и нечетным блокам. В итоге если удалить Math.random() и посмотреть что получается, увидим распределение в виде креста: Х. Если не применять чередование правил распределения, а применить только одно из них, то в итоге при применении Math.random() с одной стороны чаще всего будет больше блоков чем с противоположной.*/

    let newPlatform = Platform(widthSpace, heightSpace);
    /*
    let newPlatform = new Platform(widthSpace, heightSpace);
    let createNewPlatform = newPlatform.createPlatform();
    */
    platformsArr.push(newPlatform);
  }
}

function controlPlayer(e, isMobile = false) {
  if (isMobile) {
    if (document.body.offsetWidth / 2 > e.changedTouches[0].pageX) {
      setGoLeft();
    } else {
      setGoRight();
    }
  } else {
    if (
      e.key.toLowerCase() === "a" ||
      e.key.toLowerCase() === "ф" ||
      e.key == "ArrowLeft"
    ) {
      setGoLeft();
    } else if (
      e.key.toLowerCase() === "d" ||
      e.key.toLowerCase() === "в" ||
      e.key == "ArrowRight"
    ) {
      setGoRight();
    }
  }
  function setGoRight() {
    if (goLeft) {
      goLeft = false;
      clearInterval(goLeftLoop);
    }
    if (!goRight) {
      goRight = true;
      goRightLoop = setInterval(() => {
        player.style.marginLeft = `${
          +player.style.marginLeft.slice(0, -2) + acceleration
        }px`;
        player.style.textAlign = "right";
        setAcceleration();
        outOfFieldCheck();
      }, 30);
    }
  }

  function setGoLeft() {
    if (goRight) {
      goRight = false;
      clearInterval(goRightLoop);
    }
    if (!goLeft) {
      goLeft = true;
      goLeftLoop = setInterval(() => {
        player.style.marginLeft = `${
          +player.style.marginLeft.slice(0, -2) - acceleration
        }px`;
        player.style.textAlign = "left";
        setAcceleration();
        outOfFieldCheck();
      }, 30);
    }
  }

  function setAcceleration() {
    if (acceleration < 14) {
      acceleration += 1;
    }
  }
  function outOfFieldCheck() {
    if (
      +player.style.marginLeft.slice(0, -2) >=
      playingField.width - playerSize.width / 2
    ) {
      player.style.marginLeft = `${
        +player.style.marginLeft.slice(0, -2) - playingField.width
      }px`;
    } else if (+player.style.marginLeft.slice(0, -2) < -playerSize.width / 2) {
      player.style.marginLeft = `${
        +player.style.marginLeft.slice(0, -2) + playingField.width
      }px`;
    }
  }
}

function controlPlayerRemove() {
  acceleration = playerMovementSpeed;
  if (goLeft) {
    goLeft = false;
    clearInterval(goLeftLoop);
  } else {
    goRight = false;
    clearInterval(goRightLoop);
  }
}

function setDeformation() {
  if (deformation) {
    player.style.width = `${+player.style.width.slice(0, -2) - 1}px`;
    player.style.height = `${+player.style.height.slice(0, -2) + 1.5}px`;
  } else {
    player.style.width = `${+player.style.width.slice(0, -2) + 1}px`;
    player.style.height = `${+player.style.height.slice(0, -2) - 1.5}px`;
  }
}

function callGameOver() {
  if (elevation > localStorage.getItem("recordScore")) {
    localStorage.setItem("recordScore", elevation);
    getRecordScore();
  }
  if (mobs) {
    mobs.remove();
    mobs = null;
    mobAlreadyInSpace = false;
  }
  alert(`Поражение... Ваш результат: ${elevation}`);
  playSpace.textContent = "";
  player = null;
  disableCollisions = false;
  acceleration = 14;
  fallAcceleration = 1;
  jumpAcceleration = playerMovementSpeed;
  cameraMovementAcceleration = 15;
  elevation = 0;
  elevationNode.textContent = elevation;
  countPlatforms = 14;
  gravityNormalization = 0;
  changeGravityPlatformCount16 = true;
  changeGravityPlatformCount14 = true;
  changeGravityPlatformCount12 = true;
  changeGravityPlatformCount10 = true;
  platformsArr = [];
  gameIsRunning = false;
  gameOver = true;
  locationInSpaceY = null;
  jumping = true;
  crossing = false;
  deformation = true;

  countSteps = 0;
  countStepsUp = 0;

  clearInterval(movementLoop);
  clearInterval(jumpLoop);
  clearInterval(fallDownLoop);
  clearInterval(checkHitboxesLoop);
  cameraMove = false;

  goLeft = false;
  clearInterval(goLeftLoop);
  goRight = false;
  clearInterval(goRightLoop);

  platformRemovalHeight = 50;

  if (mobile) {
    document.removeEventListener("touchstart", (e) => controlPlayer(e, true));
    document.removeEventListener("touchend", controlPlayerRemove);
  } else {
    document.removeEventListener("keydown", controlPlayer);
    document.removeEventListener("keyup", controlPlayerRemove);
  }

  playSpace.addEventListener("click", gameLaunch);

  playOrPause.src = "icons/play.svg";
  const div = document.createElement("div");
  div.classList.add("startText");
  const h2 = document.createElement("h2");
  h2.innerText = "Кликните здесь для начала игры.";
  div.appendChild(h2);
  playSpace.appendChild(div);
}

function mobsHitBoxUp() {
  if (
    +player.style.marginTop.slice(0, -2) + playerSize.height >=
      +mobs.style.marginTop.slice(0, -2) &&
    +player.style.marginTop.slice(0, -2) + playerSize.height <=
      +mobs.style.marginTop.slice(0, -2) + mobSize.height / 3 &&
    +player.style.marginLeft.slice(0, -2) + playerSize.width >=
      +mobs.style.marginLeft.slice(0, -2) &&
    +player.style.marginLeft.slice(0, -2) <=
      +mobs.style.marginLeft.slice(0, -2) + mobSize.width
  ) {
    crossing = true;
    mobs.remove();
    mobs = null;
    mobAlreadyInSpace = false;
  }
}
function mobsHitBoxDown() {
  if (
    +player.style.marginTop.slice(0, -2) <=
      +mobs.style.marginTop.slice(0, -2) + mobSize.height &&
    +player.style.marginTop.slice(0, -2) >=
      +mobs.style.marginTop.slice(0, -2) + mobSize.height / 2 &&
    +player.style.marginLeft.slice(0, -2) + playerSize.width >=
      +mobs.style.marginLeft.slice(0, -2) &&
    +player.style.marginLeft.slice(0, -2) <=
      +mobs.style.marginLeft.slice(0, -2) + mobSize.width
  ) {
    player.style.backgroundColor = "rgb(255, 182, 182)";
    if (player.style.textAlign === "right") {
      player.classList.add("playerRotationLeft");
    } else {
      player.classList.add("playerRotationRight");
    }
    disableCollisions = true;
  }
}

function fallDown() {
  if (player) {
    fallDownLoop = setInterval(() => {
      player.style.marginTop = `${
        +player.style.marginTop.slice(0, -2) + fallAcceleration
      }px`;
      if (fallAcceleration < 20) {
        fallAcceleration++;
      }
      countStepsFallDown();
    }, 30);

    checkHitboxesLoop = setInterval(() => {
      platformsArr.forEach((item) => {
        if (player) {
          if (
            +player.style.marginTop.slice(0, -2) + playerSize.height >=
              +item.style.marginTop.slice(0, -2) &&
            +player.style.marginTop.slice(0, -2) + playerSize.height <=
              +item.style.marginTop.slice(0, -2) + platformSize.height + 5 &&
            +player.style.marginLeft.slice(0, -2) + playerSize.width >=
              +item.style.marginLeft.slice(0, -2) &&
            +player.style.marginLeft.slice(0, -2) <=
              +item.style.marginLeft.slice(0, -2) + platformSize.width &&
            !disableCollisions
          ) {
            crossing = true;
          } else if (
            player.style.marginTop.slice(0, -2) >
            bottomLine + playerSize.width
          ) {
            callGameOver();
          }
        } else {
          clearInterval(checkHitboxesLoop);
        }
      });
      if (mobs && !disableCollisions) {
        mobsHitBoxUp();
      }
      countStepsFallDown();
    }, 4);

    function countStepsFallDown() {
      if (crossing) {
        clearInterval(fallDownLoop);
        clearInterval(checkHitboxesLoop);
        jumping = true;
        fallAcceleration = 1;
        motionDetection();
      }
    }
  }
}

function jump() {
  jumpLoop = setInterval(() => {
    player.style.marginTop = `${
      +player.style.marginTop.slice(0, -2) - jumpAcceleration
    }px`;
    if (jumpAcceleration < 12) {
      jumpAcceleration++;
    }
    countStepsJump();
  }, 30);

  mobsHitBoxDownLoop = setInterval(() => {
    if (mobs) {
      mobsHitBoxDown();
    }
  }, 4);

  if (+player.style.marginTop.slice(0, -2) < playingField.height / 2) {
    cameraMove = true;
    cameraMovement();
  } else {
    cameraMove = false;
    clearInterval(movementLoop);
  }

  function countStepsJump() {
    countStepsUp += 1;
    if (countStepsUp >= 18) {
      clearInterval(jumpLoop);
      countStepsUp = 0;
      jumping = false;
      crossing = false;
      motionDetection();
    } else if (countStepsUp <= 6) {
      deformation = true;
      setDeformation();
    } else if (countStepsUp >= 12) {
      deformation = false;
      setDeformation();
    }
    if (mobs) {
      clearInterval(mobsHitBoxDownLoop);
    }
  }
}

function motionDetection() {
  if (jumping) {
    jump();
  } else {
    fallDown();
  }
}

function playerSpawner() {
  player = document.createElement("div");
  player.classList.add("player");
  player.style.width = `${playerSize.width}px`;
  player.style.height = `${playerSize.height}px`;
  player.style.marginTop = `${
    +player.style.marginTop.slice(0, -2) +
    playingField.height / 2 +
    playerSize.height / 2
  }px`;
  player.style.marginLeft = `${
    +player.style.marginLeft.slice(0, -2) +
    playingField.width / 2 -
    playerSize.width / 2
  }px`;

  playSpace.appendChild(player);

  motionDetection();
  if (mobile) {
    document.addEventListener("touchstart", (e) => controlPlayer(e, true));
    document.addEventListener("touchend", controlPlayerRemove);
  } else {
    document.addEventListener("keydown", controlPlayer);
    document.addEventListener("keyup", controlPlayerRemove);
  }
}

function cameraMovement() {
  // на самом деле мы двигаем платформы и персонажа, функция название cameraMovement скорее описывает визуальный эффект которого мы хотим добиться
  if (cameraMove) {
    if (elevation + 5 === platformRemovalHeight) {
      randomOneOrZero = Math.floor(Math.random() * Math.floor(2));
      if (randomOneOrZero) {
        mobAlreadyInSpace = true;
        createNewMobs();
      }
    }

    movementLoop = setInterval(() => {
      platformsArr.forEach((item, i, thisArr) => {
        if (
          bottomLine + 10 < +item.style.marginTop.slice(0, -2) &&
          elevation === platformRemovalHeight &&
          platformsArr.length > 4
        ) {
          item.remove();
          thisArr.splice(i, 1);
          platformRemovalHeight += 100;
        } else if (bottomLine + 10 < +item.style.marginTop.slice(0, -2)) {
          item.style.marginTop = `${
            +item.style.marginTop.slice(0, -2) - bottomLine - 35
          }px`;

          if (i % 2) {
            item.style.marginLeft = `${
              10 +
              i * (playingField.width / countPlatforms) * 0.92 * Math.random()
            }px`;
          } else {
            item.style.marginLeft = `${
              playingField.width -
              60 -
              i * (playingField.width / countPlatforms) * 0.92 * Math.random()
            }px`;
          }
          setElevation();
        } else {
          item.style.marginTop = `${
            +item.style.marginTop.slice(0, -2) + cameraMovementAcceleration
          }px`;

          if (platformsArr.length < 16 && changeGravityPlatformCount16) {
            changeGravityPlatformCount16 = false;
            gravityNormalization += 0.1;
            changePlayerGravity();
          } else if (platformsArr.length < 14 && changeGravityPlatformCount14) {
            changeGravityPlatformCount14 = false;
            gravityNormalization += 0.15;
            changePlayerGravity();
          } else if (platformsArr.length < 12 && changeGravityPlatformCount12) {
            changeGravityPlatformCount12 = false;
            gravityNormalization += 0.15;
            changePlayerGravity();
          } else if (platformsArr.length < 10 && changeGravityPlatformCount10) {
            changeGravityPlatformCount10 = false;
            gravityNormalization += 0.4;
            changePlayerGravity();
          } else if (platformsArr.length < 8 && changeGravityPlatformCount7) {
            changeGravityPlatformCount7 = false;
            gravityNormalization += 0.5;
            changePlayerGravity();
          } else if (platformsArr.length < 6 && changeGravityPlatformCount5) {
            changeGravityPlatformCount5 = false;
            gravityNormalization += 0.7;
            changePlayerGravity();
          } else {
            changePlayerGravity();
          }

          function changePlayerGravity() {
            player.style.marginTop = `${
              +player.style.marginTop.slice(0, -2) +
              cameraMovementAcceleration / countPlatforms +
              gravityNormalization
            }px`;
          }
        }
      });
      /* создать обработку столкновения */

      if (mobs) {
        if (bottomLine + 10 < +mobs.style.marginTop.slice(0, -2)) {
          mobs.remove();
          mobs = null;
          mobAlreadyInSpace = false;
        } else {
          mobs.style.marginTop = `${
            +mobs.style.marginTop.slice(0, -2) + cameraMovementAcceleration
          }px`;
        }
      }

      countStepsCameraMovement();
    }, 30);
    function createNewMobs() {
      let heightSpace = -140;
      let widthSpace;
      let randomNum = Math.floor(Math.random() * 2);
      if (randomNum % 2) {
        widthSpace =
          10 + 2 * (playingField.width / countPlatforms) * 0.92 * Math.random();
      } else {
        widthSpace =
          playingField.width -
          60 -
          10 * (playingField.width / countPlatforms) * 0.92 * Math.random();
      }
      let color;
      let randomColorNum = Math.floor(Math.random() * 3);
      if (randomColorNum === 0) {
        color = "greenMob";
      } else if (randomColorNum === 1) {
        color = "purpleMob";
      } else if (randomColorNum === 2) {
        color = "orangeMob";
      }

      let newPlatform = new Mobs(widthSpace, heightSpace, color);
      let setMob = newPlatform.createMobs();
      mobs = setMob;
    }
    function countStepsCameraMovement() {
      countSteps += 1;
      if (platformsArr.length > 8) {
        if (cameraMovementAcceleration > 10) {
          cameraMovementAcceleration -= 1;
        }
      }

      if (cameraMove && countSteps === 15) {
        cameraMove = false;
        clearInterval(movementLoop);
        countSteps = 0;
        cameraMovementAcceleration = 15;
      }
    }
  }
}

function setElevation() {
  elevation += 5;
  elevationNode.textContent = elevation;
}

function startGame() {
  playerSpawner();
  createPlatforms();
}

function gameLaunch() {
  if (gameOver && !gameIsRunning) {
    playSpace.removeEventListener("click", gameLaunch);
    gameOver = false;
    gameIsRunning = true;
    playOrPause.src = "icons/pause.svg";
    playSpace.textContent = "";
    startGame();
  } else if (!gameOver && gameIsRunning) {
    alert("Пауза... Нажмите ok что-бы продолжить играть.");
  }
}
