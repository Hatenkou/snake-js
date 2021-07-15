//настройка поля
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
//ширина и висота елементу canvas
let width = canvas.width;
let height = canvas.height;
//ширина і висота осередку
let blockSize = 10;
let widthInBlocks = width / blockSize;
let heightInBlocks = height / blockSize;
//уст. рахунку
let score = 0;
//малюнок рамки
let drawBorder = function () {
   ctx.fillStyle = "Gray";
   ctx.fillRect(0, 0, width, blockSize);
   ctx.fillRect(0, height - blockSize, width, blockSize);
   ctx.fillRect(0, 0, blockSize, height);
   ctx.fillRect(width - blockSize, 0, blockSize, height);
};
//табло рахунку в лівому куті
let drawScore = function () {
   ctx.font = "20px Courier";
   ctx.fillStyle = "Black";
   ctx.textAlign = "left";
   ctx.textBaseline = "top";
   ctx.fillText("Score: " + score, blockSize, blockSize);
};

//відміна setInterval і вивід "кінець ігри"
let gameOver = function () {
   playing = false;
   ctx.font = "60px Courier";
   ctx.fillStyle = "Black";
   ctx.textAlign = "center";
   ctx.textBaseline = "middle";
   ctx.fillText("Game Over", width / 2, height / 2);
};
//функція малюнка кола
let circle = function (x, y, radius, fillCircle) {
   ctx.beginPath();
   ctx.arc(x, y, radius, 0, Math.PI * 2, false);
   if (fillCircle) {
      ctx.fill();
   } else {
      ctx.stroke();
   }
};

//конструктор (осередку)
let Block = function (col, row) {
   this.col = col;
   this.row = row;
};

//малюнок квадрату в позиції осередку
Block.prototype.drawSquare = function (color) {
   let x = this.col * blockSize;
   let y = this.row * blockSize;
   ctx.fillStyle = color;
   ctx.fillRect(x, y, blockSize, blockSize);
};

//функція кола в позиції осередку
Block.prototype.drawCircle = function (color) {
   let centerX = this.col * blockSize + blockSize / 2;
   let centerY = this.row * blockSize + blockSize / 2;
   ctx.fillStyle = color;
   circle(centerX, centerY, blockSize / 2, true);
};

// Проверяем, находится ли эта ячейка в той же позиции,
// что и ячейка otherBlock
Block.prototype.equal = function (otherBlock) {
   return this.col === otherBlock.col && this.row === otherBlock.row;
};
//конструктор змійкі
let Snake = function () {
   this.segments = [
      new Block(7, 5),
      new Block(6, 5),
      new Block(5, 5)
   ];

   this.direction = "right";
   this.nextDirection = "right";
};
//функція малюнку квадрату для кожної частини тіла змій
Snake.prototype.draw = function () {
   this.segments[0].drawSquare("LimeGreen");
   let isEvenSegment = false;

   for (let i = 1; i < this.segments.length; i++) {
      if (isEvenSegment) {
         this.segments[i].drawSquare("Blue");
      } else {
         this.segments[i].drawSquare("Yellow");
      }

      isEvenSegment = !isEvenSegment;
   }
};
//створюєм голову і добавляємо до початку змій для руху в заданому напрямку
Snake.prototype.move = function () {
   let head = this.segments[0];
   let newHead;

   this.direction = this.nextDirection;

   if (this.direction === "right") {
      newHead = new Block(head.col + 1, head.row);
   } else if (this.direction === "down") {
      newHead = new Block(head.col, head.row + 1);
   } else if (this.direction === "left") {
      newHead = new Block(head.col - 1, head.row);
   } else if (this.direction === "up") {
      newHead = new Block(head.col, head.row - 1);
   }

   if (this.checkCollision(newHead)) {
      gameOver();
      return;
   }

   this.segments.unshift(newHead);

   if (newHead.equal(apple.position)) {
      score++;
      animationTime -= 1;
      apple.move(this.segments);
   } else {
      this.segments.pop();
   }
};

//функція на провірку чи не зіткнулася змійка зі стіною або тілом
Snake.prototype.checkCollision = function (head) {
   let leftCollision = (head.col === 0);
   let topCollision = (head.row === 0);
   let rightCollision = (head.col === widthInBlocks - 1);
   let bottomCollision = (head.row === heightInBlocks - 1);

   let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

   let selfCollision = false;

   for (let i = 0; i < this.segments.length; i++) {
      if (head.equal(this.segments[i])) {
         selfCollision = true;
      }
   }

   return wallCollision || selfCollision;
};
//функція направлення змії за допомогою клавіш
Snake.prototype.setDirection = function (newDirection) {
   if (this.direction === "up" && newDirection === "down") {
      return;
   } else if (this.direction === "right" && newDirection === "left") {
      return;
   } else if (this.direction === "down" && newDirection === "up") {
      return;
   } else if (this.direction === "left" && newDirection === "right") {
      return;
   }

   this.nextDirection = newDirection;
};

//конструктор яблука
let Apple = function () {
   this.position = new Block(10, 10);
};

//функція малюнку яблука 
Apple.prototype.draw = function () {
   this.position.drawCircle("LimeGreen");
};

//функція переміщення яблука в рандомне місце
Apple.prototype.move = function (occupiedBlocks) {
   let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
   let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
   this.position = new Block(randomCol, randomRow);

   //функція на провірку появи яблука в тілі змії
   let index = occupiedBlocks.length - 1;
   while (index >= 0) {
      if (this.position.equal(occupiedBlocks[index])) {
         this.move(occupiedBlocks); // метод move повторно
         return;
      }
      index--;
   }
};
//обєкт яблука і змії
let snake = new Snake();
let apple = new Apple();
//функція анімацій
let playing = true;
let animationTime = 100;

//функція ігрового циклу
let gameLoop = function () {
   ctx.clearRect(0, 0, width, height);
   drawScore();
   snake.move();
   snake.draw();
   apple.draw();
   drawBorder();

   //false функцией gameOver
   if (playing) {
      setTimeout(gameLoop, animationTime);
   }
};

// початок ігрового циклу
gameLoop();

//перетвореня коду в клавіші
let directions = {
   65: "left",
   87: "up",
   68: "right",
   83: "down"
};

//функція обробки нажаття клавіш
$("body").keydown(function (event) {
   let newDirection = directions[event.keyCode];
   if (newDirection !== undefined) {
      snake.setDirection(newDirection);
   }
});