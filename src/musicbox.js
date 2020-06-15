class MusicBox extends Wall
{
    constructor(x, y, w, h, imgsrc, framelist, soundsrc, note, duration=0.25)
    {
        super(x, y, w, h, null, framelist);
        this.AnimEnum = { IDLE: 0, UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4 };
        this.soundsrc = soundsrc;
        this.frame = 0;
        this.color = getRandomColor(note);
        this.originalcolor = this.color;
        this.note = note;
        this.duration = duration;
    }
    update()
    {
        for (var i = 0; i < pucks.length; i++)
        {
            var puck = pucks[i];
            if (checkCollision(this, puck))
            {
                createjs.Sound.play(this.note);
                this.color = invertColor(this.color);
                var that = this;
                setTimeout(function()
                {
                    that.color = that.originalcolor;
                    //createjs.Sound.stop(that.note)
                }, this.duration * 1000);
            }
        }
        super.update();
    }
    draw(camera)
    {
        if (checkCameraCollision(camera, this))
        {
            var oldstyle = ctx.fillStyle;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.pos.x - camera.x + camera.screenpartitionx,
                         this.pos.y - camera.y + camera.screenpartitiony,
                         this.w, this.h);
            ctx.fillStyle = invertColor(this.color);
            ctx.fillRect((this.pos.x + 4) - camera.x + camera.screenpartitionx,
                          (this.pos.y + 4) - camera.y + camera.screenpartitiony,
                          this.w - 8, this.h - 8);
            ctx.fillStyle = this.color;
            ctx.font = '20px Arial';

            ctx.fillText(this.note, (this.pos.x + this.w / 2) - 10 - camera.x + camera.screenpartitionx, 
                                    (this.pos.y + this.h / 2) + 8 - camera.y + camera.screenpartitiony);
            ctx.fillStyle = oldstyle;
        }
    }
}