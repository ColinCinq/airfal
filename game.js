var readyStateCheckInterval = setInterval( function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        initGame();
    }
}, 10);


var bgLoc = {x:0, y:0, width:32, height:32};
var groundLoc = {x:0, y:31, width:35, height:1};
var instructionsLoc = {x:6, y:49, width:17, height:21};
var gameOverLoc = {x:6, y:32, width:21, height:17};
var birdLocs = [{x:6, y:70, width:5, height:3}, {x:11, y:70, width:5, height:3}, {x:16, y:70, width:5, height:3}];
var tubeLoc = {x:0, y:32, width:6, height:44};
var scoreLocs = [
    {x:32, y:68, width:5, height:9},
    {x:27, y:32, width:5, height:9},
    {x:32, y:32, width:5, height:9},
    {x:27, y:41, width:5, height:9},
    {x:32, y:41, width:5, height:9},
    {x:27, y:50, width:5, height:9},
    {x:32, y:50, width:5, height:9},
    {x:27, y:59, width:5, height:9},
    {x:32, y:59, width:5, height:9},
    {x:27, y:68, width:5, height:9}
];

var flappyBirdSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABNCAMAAAAW510GAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAnUExURXvFzQAAAOr924nmi3bCLJ7qWOL/i1aCIf///zNUnuwcJN62LwAAAL284i8AAAANdFJOU////////////////wA96CKGAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABa0lEQVRIS+2SYXuDMAiEa2er2/z/v3fcHQS00bp93ONFISGvQNTbOy2Qz/d1UaGLCv0P6n6/Y2kuJ+lFYX4kUR9vdFEhUePjeXA94Ixaxuc4LcuQijm9Fo2a51m3BTVDjGYulHax46ylAQX7SvkYrGlzW4oZ2rB9pzYV1yMpy7amvCNZ9qW7U5EUStLWirZ1pKBaKnjlcAJqVBvc90t0VuxS7jsU4llxj+KWrFc0Uym/OPdTY2nmNoGaolF6UQ7whQe1FXPhEVH4YfHJqmqMrlEs5XfEmjIX+/KmPIYnaIJity8U8sD8hdr0dVSxntGDSTV5oEspf6nnkXXFfBe+rumTap358jSVFfW1FVSIBGRJ/MH4v7ZybkMhiYXkW0JSqNj+Vaa3W6NQNn5Jcd2lehXXfbmSQr7IpDOKgIKyuAIUE+mxVUVsab9BKADKhlM1kWmPWj6/vqsRxYqV6siSnqBY8yzFMx5JZxmGH/hCMp/RbN51AAAAAElFTkSuQmCC";
var spriteSheetImage = new Image();
spriteSheetImage.src = flappyBirdSource;
var spriteSheetCanvas = document.createElement("canvas");
spriteSheetCanvas.width = spriteSheetImage.width;
spriteSheetCanvas.height = spriteSheetImage.height;
var spriteSheetContext = spriteSheetCanvas.getContext("2d");
spriteSheetContext.drawImage(spriteSheetImage, 0, 0);

var renderCanvas = document.createElement("canvas");
renderCanvas.width = renderCanvas.height = 32;
var renderContext = renderCanvas.getContext("2d");
renderContext.globalCompositeOperation = "destination-over";
var collisionCanvas = document.createElement("canvas");

function drawSpriteSheetImage(context, locRect, x, y){
    context.drawImage(spriteSheetImage, locRect.x, locRect.y, locRect.width, locRect.height, x, y, locRect.width, locRect.height);
}

var canvas, context, gameState, score, groundX = 0, birdY, birdYSpeed, birdX = 5, birdFrame = 0, activeTube, tubes = [], collisionContext, scale;
var HOME = 0, GAME = 1, GAME_OVER = 2;

function initGame(){
    canvas = document.getElementById("gameCanvas");
    context = canvas.getContext("2d");
    scale = Math.floor(Math.min(window.innerHeight, window.innerWidth) / 32);
    canvas.width = scale * 32;
    canvas.height = scale * 32;
    canvas.style.left = window.innerWidth / 2 - (scale * 32) / 2 + "px";
    canvas.style.top = window.innerHeight / 2 - (scale * 32) / 2 + "px";
    window.addEventListener( "keydown", handleUserInteraction, false );
    canvas.addEventListener('touchstart', handleUserInteraction, false);
    canvas.addEventListener('mousedown', handleUserInteraction, false);
    collisionCanvas.width = birdX + 8;
    collisionCanvas.height = 32;
    collisionContext = collisionCanvas.getContext("2d");
    collisionContext.globalCompositeOperation = "xor";
    startGame();
    setInterval(loop, 40);
}

function startGame(){
    gameState = HOME;
    birdYSpeed = score = 0;
    birdY = 14;
    for(var i = 0; i < 2; i++){
        tubes[i] = {x : Math.round(48 + i * 19) };
        setTubeY(tubes[i]);
    }
}

function loop(){
    switch(gameState){
        case HOME: renderHome();
            break;
        case GAME : renderGame();
            break;
        case GAME_OVER: renderGameOver();
            break;
    }
}

function handleUserInteraction(event){
    switch(gameState){
        case HOME: gameState = GAME;
            break;
        case GAME : birdYSpeed = -1.4;//"tap boost"
            break;
        case GAME_OVER: startGame();
            break;
    }
    if(event){
        event.preventDefault();//stop propagation chain
    }
}

function renderHome(){
    renderContext.clearRect(0,0,32,32);
    drawSpriteSheetImage(renderContext, instructionsLoc, 32 - instructionsLoc.width - 1, 1);
    updateBirdHome();
    renderGround(true);
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

function renderGame(){
    renderContext.clearRect(0,0,32,32);
    collisionContext.clearRect(0,0,collisionCanvas.width, collisionCanvas.height);
    renderScore();
    renderGround(true);
    renderTubes();
    updateBirdGame();
    checkCollision();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

function renderGameOver(){
    renderContext.clearRect(0,0,32,32);
    drawSpriteSheetImage(renderContext, gameOverLoc, Math.floor(16 - gameOverLoc.width/2), Math.floor(16 - gameOverLoc.height/2));
    renderGround();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

function renderToScale(){
    var i, data = renderContext.getImageData(0,0,32, 32).data;
    for(i=0; i<data.length; i+=4){
        context.fillStyle = "rgb("+data[i]+","+data[i+1]+","+data[i+2]+")";
        context.fillRect(((i/4) % 32) * scale, Math.floor(i / 128) * scale, scale, scale);
    }
}

function checkCollision(){
    if(birdX == tubes[activeTube].x + 6){
        score++;
    }
    var collisionData = collisionContext.getImageData(birdX, birdY, 5, 3).data;
    var data = renderContext.getImageData(birdX, birdY, 5, 3).data;
    for(var i = 0; i< collisionData.length; i+=4){
        if(collisionData[i+3] != data[i+3]){
            gameState = GAME_OVER;
            break;
        }
    }
}

function renderScore(){
    var parts = score.toString().split("");
    var length = parts.length;
    for(var i=0; i<length; i++){
        drawSpriteSheetImage(renderContext, scoreLocs[parseInt(parts.pop())], 25 - 5 * i, 1);
    }
}

function renderGround(move){
    if(move && --groundX < bgLoc.width - groundLoc.width){
        groundX = 0;
    }
    drawSpriteSheetImage(renderContext, groundLoc, groundX, 31);
}

function updateBirdHome(){
    drawSpriteSheetImage(renderContext, birdLocs[birdFrame], birdX, birdY);
    birdFrame++;
    birdFrame %= 3;
}

function updateBirdGame(){
    birdY = Math.round(birdY + birdYSpeed);
    birdYSpeed += .25;//Gravity, change this to your likings
    if(birdY < 0){
        birdY = 0;
        birdYSpeed = 0;
    }
    if(birdY + 3 > 32 - groundLoc.height){
        birdY = 28;
        birdYSpeed = 0;
    }
    renderContext.save();
    collisionContext.save();
    renderContext.translate(birdX, birdY);
    collisionContext.translate(birdX, birdY);
    drawSpriteSheetImage(renderContext, birdLocs[birdFrame], 0, 0);
    drawSpriteSheetImage(collisionContext, birdLocs[birdFrame], 0, 0);
    renderContext.restore();
    collisionContext.restore();
    birdFrame++;
    birdFrame %= 3;
}

function renderTubes(){
    var i, tube;
    activeTube = tubes[0].x < tubes[1].x ? 0 : 1;
    for(i= 0; i < 2;i++){
        tube = tubes[i];
        if(--tube.x <= -6 ){
            tube.x = 32;
            setTubeY(tube);
        }
        drawSpriteSheetImage(renderContext, tubeLoc, tube.x, tube.y );
        drawSpriteSheetImage(collisionContext, tubeLoc, tube.x, tube.y );
    }
}

function setTubeY(tube){
    tube.y = Math.floor(Math.random() * (bgLoc.height - tubeLoc.height) );
}