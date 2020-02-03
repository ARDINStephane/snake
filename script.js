window.onload = function () {
    var game;
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize  = 30;
    var canvasWidthInBlocks = canvasWidth/blockSize;
    var canvasHeightInBlocks = canvasHeight/blockSize;
    var canvas;
    var ctx;
    var delay = 100;
    var snake;
    var apple;
    var score;
    var timeout;
    var pause;

    function init()
    {
        game = new Game();
        score = new Score();
        score.draw();
        canvas = new Canvas();
        canvas.draw();
        snake = new Snake([[5,4], [4,4], [3,4]], 'right');
        apple = new Apple([0,0]);
        apple.setNewPosition();
        pause = new Pause();
        game.refreshCanvas();
    }

    function Game() {
        this.refreshCanvas = function () {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            if(snake.checkCollision()) {
                game.gameOver();
            } else {
                if(snake.isEatingApple(apple)) {
                    score.setScore();
                    score.draw();
                    apple.setNewPosition();
                    do{
                        apple.setNewPosition();
                    } while (apple.isOnSnake(snake));
                }
                apple.draw();
                snake.walk();
                snake.draw();
                pause.draw();
                timeout = setTimeout(game.refreshCanvas, delay);
            }
        };

        this.gameOver = function()
        {
            ctx.save();
            ctx.font = "bold 70px sans-serif";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 5;
            var centreX = canvasWidth/2;
            var centreY = canvasHeight/2;
            ctx.fillText('Game Over!',centreX, centreY - 180);
            ctx.font = "bold 30px sans-serif";
            ctx.fillText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 100);
            pause.status = "";
            ctx.restore();
        };

        this.restart = function()
        {
            score = 0;
            snake = new Snake([[5,4], [4,4], [3,4]], 'right');
            apple = new Apple([0,0]);
            apple.setNewPosition();
            score = new Score();
            pause = new Pause();
            score.draw();
            clearTimeout(timeout);
            game.refreshCanvas();
        };

        this.drawBlock = function(ctx, position)
        {
            var x = position[0] * blockSize;
            var y = position[1] * blockSize;

            ctx.fillRect(x, y, blockSize, blockSize);
        };
    }

    function Score()
    {
        this.score = 0;
        this.draw = function () {
            this.scoreElement = document.querySelector( '#score-js' );
            score.className += "score-js";
            this.scoreElement.textContent = 'Score: ' + this.score;
        };
        this.setScore = function () {
            this.score += 10;
        };
    }

    function Canvas()
    {
        this.draw = function () {
            canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
            canvas.className += "canvas";
        };
    }
    
    function Snake(body, direction)
    {
        this.body = body;
        this.direction = direction;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#ff0000";
            for(var i = 0; i < this.body.length; i++) {
                game.drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        };
        this.walk = function () {
            var nexPosition = this.body[0].slice();
            switch(this.direction){
                case 'left':
                    nexPosition[0] -= 1;
                    break;
                case 'right':
                    nexPosition[0] += 1;
                    break;
                case 'down':
                    nexPosition[1] += 1;
                    break;
                case 'up':
                    nexPosition[1] -= 1;
                    break;
                default:
                    throw('Direction invalide');
            }
            this.body.unshift(nexPosition);
            if(!snake.isEatingApple(apple)) {
                this.body.pop();
            }
        };
        this.setDirection = function(newDirection) {
            this.allowedDirection;
            switch(this.direction){
                case 'left':
                case 'right':
                    this.allowedDirection = ['up', 'down'];
                    break;
                case 'down':
                case 'up':
                    this.allowedDirection = ['left', 'right'];
                    break;
                default:
                    throw('Direction invalide');
            }
            if(this.allowedDirection.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        this.checkCollision = function () {
            var wallCollision = false;
            var snakeCollision = false;
            var head = body[0];
            var headX = head[0];
            var headY = head[1];
            var rest = body.slice(1);
            var minX = 0;
            var minY = 0;
            var maxX = canvasWidthInBlocks - 1;
            var maxY = canvasHeightInBlocks - 1;

            var wallCollisionX = headX < minX || headX > maxX;
            var wallCollisionY = headY < minY || headY > maxY;

            if(wallCollisionX || wallCollisionY){
                wallCollision = true;
            }

            for(var i = 0; i < rest.length; i++){
                if(headX === rest[i][0] && headY === rest[i][1]){
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };
        this.isEatingApple = function(apple)
        {
            var head = body[0];
            var headX = head[0];
            var headY = head[1];

            return headX === apple.position[0] && headY === apple.position[1];
        };
    }

    function Apple(position)
    {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x,y, radius, 0, Math.PI*2, true);
            ctx.fill();

            ctx.restore();
        };
        this.setNewPosition = function () {
            var newX = Math.round(Math.random() * (canvasWidthInBlocks - 1));
            var newY = Math.round(Math.random() * (canvasHeightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snake)
        {
            var isOnSnake = false;
            for(var i = 0; i < snake.body.length; i++){
                if(this.position[0] === snake.body[i][0] && this.position[1] === snake.body[i][1])
                isOnSnake = true;
            }
            return isOnSnake;
        };
    }

    function Pause() {
        this.sentence = "Appuyer sur la touche 'P' pour mettre en pause !";
        this.status = false;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#ffffff";
            ctx.fillText(this.sentence, canvasWidth - 220, 20);
            ctx.restore();
        };
    }

    document.onkeydown = function handleKeyDown(e) {
        var key = e.code;
        var newDirection;

        switch(key){
            case 'ArrowLeft':
                e.preventDefault();
                newDirection = 'left';
                break;
            case 'ArrowUp':
                e.preventDefault();
                newDirection = 'up';
                break;
            case 'ArrowRight':
                e.preventDefault();
                newDirection = 'right';
                break;
            case 'ArrowDown':
                e.preventDefault();
                newDirection = 'down';
                break;
            case 'Space':
                e.preventDefault();
                game.restart();
                return;
            case 'KeyP':
                e.preventDefault();
                if(pause.status === ""){
                    return;
                }
                else if(!pause.status) {
                    pause.sentence = "Appuyer sur la touche 'P' pour continuer !";
                    pause.status = true;
                    ctx.clearRect(canvasWidth - 220,0, canvasWidth, 25);
                    pause.draw();
                    clearTimeout(timeout);
                } else {
                    pause.sentence = "Appuyer sur la touche 'P' pour mettre en pause !";
                    pause.status = false;
                    game.refreshCanvas();
                }
                return;
            default:
                return;
        }
        snake.setDirection(newDirection);
    };

    init();
};