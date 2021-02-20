const play = document.getElementById("play");
const playOrPause = document.getElementById("playOrPause");
const volumeMute = document.getElementById("volumeMute");
const volumeUp = document.getElementById("volumeUp");
const playSpace = document.getElementById("playingField");
const elevationNode = document.getElementById("elevation");

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
const bottomLine = playingField.height;
const playerMovementSpeed = 4;
let player;
let acceleration = 14;
let fallAcceleration = playerMovementSpeed;
let jumpAcceleration = playerMovementSpeed;
let cameraMovementAcceleration = 10;
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
let gameIsRunning = false;
let gameOver = true;
let locationInSpaceY = null;
let jumping = true;
let crossing = false;
let deformation = true;

let countSteps = 0;
let countStepsUp = 0;

let movementLoop;
let jumpLoop;
let fallDownLoop;
let checkHitboxesLoop;

let cameraMove = false;

let platformRemovalHeight = 50;

play.addEventListener("click", gameLaunch);

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
    } /* для того что-бы равномернее распределить блоки по полю применяем разные условия распределения к четным и нечетным блокам. В итоге если удалить Math.random() и посмотреть что получается, увидим распределение в виде креста: Х. Если не применять чередование правил распределения, а применить только одно из них, то в итоге при применении Math.random() с одной стороны всегда будет больше блоков чем с противоположной.*/

    let newPlatform = new Platform(widthSpace, heightSpace);
    let createNewPlatform = newPlatform.createPlatform();
    platformsArr.push(createNewPlatform);
  }
}

function physics() {}

function controlPlayer(e) {
  if (
    e.key.toLowerCase() === "a" ||
    e.key.toLowerCase() === "ф" ||
    e.key == "ArrowLeft"
  ) {
    player.style.marginLeft = `${
      +player.style.marginLeft.slice(0, -2) - acceleration
    }px`;
    player.style.textAlign = "left";
    setAcceleration();
    outOfFieldCheck();
  } else if (
    e.key.toLowerCase() === "d" ||
    e.key.toLowerCase() === "в" ||
    e.key == "ArrowRight"
  ) {
    player.style.marginLeft = `${
      +player.style.marginLeft.slice(0, -2) + acceleration
    }px`;
    player.style.textAlign = "right";
    setAcceleration();
    outOfFieldCheck();
  }
  function setAcceleration() {
    if (acceleration < 18) {
      acceleration += 2;
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
  playSpace.textContent = "";
  player = null;
  acceleration = 14;
  fallAcceleration = playerMovementSpeed;
  jumpAcceleration = playerMovementSpeed;
  cameraMovementAcceleration = 10;
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

  platformRemovalHeight = 50;

  document.removeEventListener("keydown", controlPlayer);
  document.removeEventListener(
    "keyup",
    () => (acceleration = playerMovementSpeed)
  );
  alert("game over");
  playOrPause.src = "icons/play.svg";
}

function fallDown() {
  if (player) {
    fallDownLoop = setInterval(() => {
      player.style.marginTop = `${
        +player.style.marginTop.slice(0, -2) + fallAcceleration
      }px`;
      if (fallAcceleration < 12) {
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
            +player.style.marginTop.slice(0, -2) <=
              +item.style.marginTop.slice(0, -2) - playerSize.height / 2 &&
            +player.style.marginLeft.slice(0, -2) + playerSize.width >=
              +item.style.marginLeft.slice(0, -2) &&
            +player.style.marginLeft.slice(0, -2) <=
              +item.style.marginLeft.slice(0, -2) + platformSize.width
          ) {
            crossing = true;
          } else if (player.style.marginTop.slice(0, -2) > bottomLine) {
            callGameOver();
          }
        } else {
          clearInterval(checkHitboxesLoop);
        }
      });
      countStepsFallDown();
    }, 4);

    function countStepsFallDown() {
      if (crossing) {
        clearInterval(fallDownLoop);
        clearInterval(checkHitboxesLoop);
        jumping = true;
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

  document.addEventListener("keydown", controlPlayer);
  document.addEventListener(
    "keyup",
    () => (acceleration = playerMovementSpeed)
  );
}

function cameraMovement() {
  // на самом деле мы двигаем платформы и персонажа, функция название cameraMovement скорее описывает визуальный эффект которого мы хотим добиться
  if (cameraMove) {
    movementLoop = setInterval(() => {
      platformsArr.forEach((item, i, thisArr) => {
        if (
          bottomLine + 10 < +item.style.marginTop.slice(0, -2) &&
          elevation === platformRemovalHeight &&
          platformsArr.length > 3
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

      countStepsCameraMovement();
    }, 30);
    function countStepsCameraMovement() {
      countSteps += 1;
      if (cameraMovementAcceleration < 15) {
        cameraMovementAcceleration += 1;
      }

      if (cameraMove && countSteps == 15) {
        cameraMove = false;
        clearInterval(movementLoop);
        countSteps = 0;
        cameraMovementAcceleration = 10;
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
  physics();
}

function gameLaunch() {
  if (gameOver && !gameIsRunning) {
    gameOver = false;
    gameIsRunning = true;
    playOrPause.src = "icons/pause.svg";
    startGame();
  } else if (!gameOver && gameIsRunning) {
    alert("Пауза... Нажмите ok что-бы продолжить играть.");
  }
}
