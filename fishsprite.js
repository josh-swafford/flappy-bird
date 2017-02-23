var fishSprite;
var backgroundSprite;
var foregroundSprite;
var topCoralSprite;
var bottomCoralSprite;
var textSprites;
var scoreSprite;
var buttonSprites;
var s_numberS;
var s_numberB;

function Sprite(img, x, y, width, height){
    this.img = img;
    this.x = x*2;
    this.y = y*2;
    this.width = width*2;
    this.height = height*2;
}

Sprite.prototype.draw = function (renderingContext, x, y) {
    renderingContext.drawImage(this.img, this.x, this.y, this.width, this.height, x, y, this.width, this.height);
};

function initSprites(img){
    fishSprite = [
        new Sprite(img, 156, 115, 17, 12),
        new Sprite(img, 156, 128, 17, 12),
        new Sprite(img, 156, 141, 17, 12)
    ];

    backgroundSprite = new Sprite(img, 0, 0, 138, 114);
    backgroundSprite.color = "#70C5CF"; // save background color
    foregroundSprite = new Sprite(img, 138, 0, 112,  56);

    topCoralSprite = new Sprite(img, 251, 0, 26, 200);
    bottomCoralSprite = new Sprite(img, 277, 0, 26, 200);

    textSprites = {
        FlappyBird: new Sprite(img, 59, 114, 96, 22),
        GameOver:   new Sprite(img, 59, 136, 94, 19),
        GetReady:   new Sprite(img, 59, 155, 87, 22)
    }
    buttonSprites = {
        Score: new Sprite(img,  79, 191, 40, 14),
        Ok:    new Sprite(img, 119, 191, 40, 14),
    }

    scoreSprite = new Sprite(img, 138,  56, 113, 58);

    s_numberS = new Sprite(img, 0, 177, 6,  7);
    s_numberB = new Sprite(img, 0, 188, 7, 10);

    s_numberS.draw = s_numberB.draw = function(ctx, x, y, num, center, offset) {
        num = num.toString();

        var step = this.width + 2;

        if (center) {
            x = center - (num.length*step-2)/2;
        }
        if (offset) {
            x += step*(offset - num.length);
        }

        for (var i = 0, len = num.length; i < len; i++) {
            var n = parseInt(num[i]);
            ctx.drawImage(img, step*n, this.y, this.width, this.height, x, y, this.width, this.height);
            x += step;
        }
    }
}

