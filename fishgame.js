
var canvas;
var renderingContext;
var width;
var height;
var fgpos = 0;
var frames = 0;
var score = 0;
var best = localStorage.getItem("best") || 0;
var currentstate;
var states = {
    Splash: 0,
    Game: 1,
    Score: 2
};
var okbtn;
var  bird = {

    x: 60,
    y: 0,

    frame: 0,
    velocity: 0,
    animation: [0, 1, 2, 1],

    rotation: 0,
    radius: 12,

    gravity: 0.25,
    _jump: 4.6,


    jump: function() {
        this.velocity = -this._jump;
    },


    update: function() {
        // make sure animation updates and plays faster in gamestate
        var n = currentstate === states.Splash ? 10 : 5;
        this.frame += frames % n === 0 ? 1 : 0;
        this.frame %= this.animation.length;

        // in splash state make bird hover up and down and set
        // rotation to zero
        if (currentstate === states.Splash) {

            this.y = height - 280 + 5*Math.cos(frames/10);
            this.rotation = 0;

        } else { // game and score state //

            this.velocity += this.gravity;
            this.y += this.velocity;

            // change to the score state when bird touches the ground
            if (this.y >= height - foregroundSprite.height-10) {
                this.y = height - foregroundSprite.height-10;
                if (currentstate === states.Game) {
                    currentstate = states.Score;
                }
                // sets velocity to jump speed for correct rotation
                this.velocity = this._jump;
            }

            // when bird lack upward momentum increment the rotation
            // angle
            if (this.velocity >= this._jump) {

                this.frame = 1;
                this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);

            } else {

                this.rotation = -0.3;

            }
        }
    },

    /**
     * Draws bird with rotation to canvas renderingContext
     *
     * @param  {CanvasRenderingContext2D} renderingContext the context used for
     *                                        drawing
     */
    draw: function(renderingContext) {
        renderingContext.save();
        // translate and rotate renderingContext coordinatesystem
        renderingContext.translate(this.x, this.y);
        renderingContext.rotate(this.rotation);

        var n = this.animation[this.frame];
        // draws the bird with center in origo
        fishSprite[n].draw(renderingContext, -fishSprite[n].width/2, -fishSprite[n].height/2);

        renderingContext.restore();
    }
};


var pipes = {
    _pipes: [],
    reset: function() {
        this._pipes = [];
    },

    update: function() {
        // add new pipe each 100 frames
        if (frames % 100 === 0) {
            // calculate y position
            var _y = height - (bottomCoralSprite.height+foregroundSprite.height+120+200*Math.random());
            // create and push pipe to array
            this._pipes.push({
                x: 500,
                y: _y,
                width: bottomCoralSprite.width,
                height: bottomCoralSprite.height
            });
        }
        for (var i = 0, len = this._pipes.length; i < len; i++) {
            var p = this._pipes[i];

            if (i === 0) {

                score += p.x === bird.x ? 1 : 0;

                // collision check, calculates x/y difference and
                // use normal vector length calculation to determine
                // intersection
                var cx  = Math.min(Math.max(bird.x, p.x), p.x+p.width);
                var cy1 = Math.min(Math.max(bird.y, p.y), p.y+p.height);
                var cy2 = Math.min(Math.max(bird.y, p.y+p.height+80), p.y+2*p.height+80);
                // closest difference
                var dx  = bird.x - cx;
                var dy1 = bird.y - cy1;
                var dy2 = bird.y - cy2;
                // vector length
                var d1 = dx*dx + dy1*dy1;
                var d2 = dx*dx + dy2*dy2;
                var r = bird.radius*bird.radius;
                // determine intersection
                if (r > d1 || r > d2) {
                    currentstate = states.Score;
                }
            }
            // move pipe and remove if outside of canvas
            p.x -= 2;
            if (p.x < -p.width) {
                this._pipes.splice(i, 1);
                i--;
                len--;
            }
        }
    },


    draw: function(renderingContext) {
        for (var i = 0, len = this._pipes.length; i < len; i++) {
            var p = this._pipes[i];
            bottomCoralSprite.draw(renderingContext, p.x, p.y);
            topCoralSprite.draw(renderingContext, p.x, p.y+80+p.height);
        }
    }
};


function onpress(evt) {

    switch (currentstate) {

        // change state and update bird velocity
        case states.Splash:
            currentstate = states.Game;
            bird.jump();
            break;

        // update bird velocity
        case states.Game:
            bird.jump();
            break;

        // change state if event within okbtn bounding box
        case states.Score:
            // get event position
            var mx = evt.offsetX, my = evt.offsetY;

            if (mx == null || my == null) {
                mx = evt.touches[0].clientX;
                my = evt.touches[0].clientY;
            }

            // check if within
            if (okbtn.x < mx && mx < okbtn.x + okbtn.width &&
                okbtn.y < my && my < okbtn.y + okbtn.height
            ) {
                pipes.reset();
                currentstate = states.Splash;
                score = 0;
            }
            break;

    }
}


function main() {
    canvas = document.createElement("canvas");

    width = window.innerWidth;
    height = window.innerHeight;

    var evt = "touchstart";
    if (width >= 500) {
        width  = 320;
        height = 480;
        canvas.style.border = "1px solid #000";
        evt = "mousedown";
    }

    document.addEventListener(evt, onpress);

    canvas.width = width;
    canvas.height = height;
    if (!(!!canvas.getContext && canvas.getContext("2d"))) {
        alert("Your browser doesn't support HTML5, please update to latest version");
    }
    renderingContext = canvas.getContext("2d");

    currentstate = states.Splash;
    document.body.appendChild(canvas);

    var img = new Image();
    img.onload = function() {
        initSprites(this);
        renderingContext.fillStyle = backgroundSprite.color;

        okbtn = {
            x: (width - buttonSprites.Ok.width)/2,
            y: height - 200,
            width: buttonSprites.Ok.width,
            height: buttonSprites.Ok.height
        }

        run();
    }
    img.src = "images/fbirdsprite.png";
}


function run() {
    var loop = function() {
        update();
        render();
        window.requestAnimationFrame(loop, canvas);
    }
    window.requestAnimationFrame(loop, canvas);
}


function update() {
    frames++;

    if (currentstate !== states.Score) {
        fgpos = (fgpos - 2) % 14;
    } else {
        best = Math.max(best, score);
        localStorage.setItem("best", best);
    }
    if (currentstate === states.Game) {
        pipes.update();
    }

    bird.update();
}


function render() {
    renderingContext.fillRect(0, 0, width, height);
    backgroundSprite.draw(renderingContext, 0, height - backgroundSprite.height);
    backgroundSprite.draw(renderingContext, backgroundSprite.width, height - backgroundSprite.height);

    pipes.draw(renderingContext);
    bird.draw(renderingContext);

    foregroundSprite.draw(renderingContext, fgpos, height - foregroundSprite.height);
    foregroundSprite.draw(renderingContext, fgpos+foregroundSprite.width, height - foregroundSprite.height);

    var width2 = width/2;

    if (currentstate === states.Score) {
        textSprites.GameOver.draw(renderingContext, width2 - textSprites.GameOver.width/2, height-400);
        scoreSprite.draw(renderingContext, width2 - scoreSprite.width/2, height-340);
        buttonSprites.Ok.draw(renderingContext, okbtn.x, okbtn.y);
        s_numberS.draw(renderingContext, width2-47, height-304, score, null, 10);
        s_numberS.draw(renderingContext, width2-47, height-262, best, null, 10);

    } else {

        s_numberB.draw(renderingContext, null, 20, score, width2);

    }
}
