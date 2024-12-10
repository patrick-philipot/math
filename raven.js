/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
// Fenêtres modales
const dialogWin = document.querySelector("dialWin")
const dialogNoWin = document.querySelector("dialNoWin")
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
ctx.font = '50px Impact';

// ID for requestAnimationFrame(animate)
let myReq;
// let deltaTime=0

// global variables init
let score = 0;
let gameOver = false;
// win sera vrai si le raven arrivé premier contient la bonne réponse
let win = false;
let timeToNextRaven = 0;
// Limiter le nombre raven
// let ravenInterval = 500;
let ravenInterval = 2000;
let lastTime = 0;
let ravens = [];
let explosions = [];
winSound = new Audio();
winSound.src = "bravo.wav";
nowinSound = new Audio();
nowinSound.src = "oops.wav";


function getProposition() {
  // retourne une des propositions de current_Defi
  len = current_defi.propositions.length ;
  proposition = 0 + current_defi.propositions[Math.floor(Math.random() * (len))]
  // console.log("proposition : ", proposition)
  return proposition
}

class Raven {
  constructor(){
    // TO DO afficher une des réponses aléatoirement
    this.num = getProposition()
    this. spriteWidth = 271;
    this. spriteHeight = 194;
    // taille des ravens
    // this.sizeModifier = Math.random() * 0.6 + 0.4
    this.sizeModifier = Math.random() * (0.6) + 1;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    // régler la vitesse des ravens
    //this.directionX = Math.random() * 5 + 3;
    this.directionX = Math.random() * 4 + 2;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = 'raven.png';
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    this.color = 'rgb(' + this.randomColor[0] + ',' + this.randomColor[1] + ',' + this.randomColor[2] + ')' ;
  }
  update(deltatime) {
    // console.log(`deltatime raven = ${deltatime}`);
    if (this.y < 0 || this.y > canvas.height - this.height){
      this.directionY = -this.directionY;
    }
    // console.log(`directionX = ${this.directionX}`);
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += deltatime;
    if(this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
    } 
    if (this.x < 0 - this.width) { 
      gameOver = true; 
      win = ( this.num == current_defi.solution );
    }
  }
  draw(){
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image,this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    // display number
    ctx.fillStyle = 'white';
    ctx.fillText(this.num.toString(), this.x + this.width/2, this.y + this.height*0.66);
    ctx.fillStyle = 'red';
    ctx.fillText(this.num.toString(), this.x + this.width/2 + 2, this.y + this.height*0.66 + 2) ;
  }
}


class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0; 
    this.maxFrame = 5;
    this.sound = new Audio();
    this.sound.src = "boom.wav";
    this.timeSinceLastFrame = 0; 
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    //console.log(`deltaTime explosion = ${deltaTime}`);
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval){
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > this.maxFrame) this.markedForDeletion = true;
      // console.log("explosion frame", this.frame);
    }
  }
  draw() {
    //console.log("explosion frame", this.frame);
    ctx.drawImage(this.image,this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size)
  }

}


/* function drawScore() {
  ctx.fillStyle = 'black';
  ctx.fillText('Score: ' + score, 50, 75);
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 55, 80);
} */

// TODO remplacer drawGameOver

function handleGameOver() {
  ravens = [];
  explosions = [];
  // stop current animation
  window.cancelAnimationFrame(myReq);
  // affichage du résultat
  //console.log( 10, "Défi terminé")
  if (win) {
    winSound.play()
    dialWin.showModal()
    dialWin.addEventListener('close', (e) => {
      //console.log('Return value:', 'Win');
      //window.location.replace(location.pathname);
      location.reload()
    });
  }  else {
    nowinSound.play()
    dialNoWin.showModal()
    dialNoWin.addEventListener('close', (e) => {
      //console.log('Return value:', 'NoWin');
      location.reload()
    });
  }
  // startPlaying()
}

document.addEventListener('click', function(e) {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pc = detectPixelColor.data;
  ravens.forEach(object => {
    // TODO :: distinguer les bonnes et les mauvaises réponses
    if (object.randomColor[0] === pc[0] && object.randomColor[1] === pc[1] && object.randomColor[2] === pc[2] ) {
      object.markedForDeletion = true;
      score++;
      explosions.push(new Explosion(object.x, object.y, object.width));
      // console.log(explosions);
    }
  } );
});

function animate(timestamp) {
  collisionCtx.clearRect(0,0,canvas.width, canvas.height)
  ctx.clearRect(0,0,canvas.width, canvas.height)
  // Question text
  current_font = ctx.font;
  ctx.font = '250px Impact';
  ctx.fillStyle = 'white';
  ctx.fillText(current_defi.text, canvas.width/3, canvas.height/5);  

  ctx.font = current_font;
  let deltaTime = timestamp - lastTime;
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltaTime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort(function(a,b) {
      return a.width - b.width;
    })
  }
  // drawScore();
  [...ravens, ...explosions].forEach(object => object.update(deltaTime));
  [...ravens, ...explosions].forEach(object => object.draw());
  ravens = ravens.filter(object => !object.markedForDeletion)
  explosions = explosions.filter(object => !object.markedForDeletion)

  // TODO :: gérer les bonnes réponses
  if (!gameOver) myReq = window.requestAnimationFrame(animate);
  else {
    // afficher la solution
    current_font = ctx.font;
    ctx.font = '250px Impact';
    ctx.fillStyle = 'white';
    ctx.fillText(current_defi.text+current_defi.solution, canvas.width/3, canvas.height/5);  
    ctx.font = current_font;
    handleGameOver();
  }
}

function startPlaying() {
  // variables re-init
  score = 0;
  gameOver = false;
  // win sera vrai si le raven arrivé premier contient la bonne réponse
  win = false;
  timeToNextRaven = 0;
  // Limiter le nombre raven
  // let ravenInterval = 500;
  ravenInterval = 2000;
  //lastTime = 0;
  //deltaTime = 0;
  ravens = [];
  explosions = [];
  
  // Recherche d'un nouveau défi
  // calcul indice
  f = Math.random() * (defis.length)
  current_defi = defis[ Math.floor(f)]

  // démarrer l'animation
  animate(0);
}

// lire paramètres URL
// const queryString = window.location.search;
// console.log(`queryString ${queryString}`);

startPlaying();
