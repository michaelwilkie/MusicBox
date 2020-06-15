class Puck extends Entity
{
    constructor(x, y, w, h, velX, velY, imgsrc, framelist)
    {
        super(x, y, w, h, imgsrc, framelist);
        this.isTouching = false;
        this.radius = 16;
        this.frame = 2;
        this.speed = 5;
        this.vel = {x: velX, y: velY};
        this.setGravity(0, 0);
        this.setFriction(0, 0);
    }
    update()
    { 
        for (var i = 0; i < entlist.length; i++)
        {
            if (this == entlist[i] || entlist[i] instanceof Puck) // Puck: don't consider myself when checking collisions or other pucks
                continue;
            if (checkCollision(this, entlist[i]))
            {
                // collision code here
            }
        }    
        if (!this.animfinished)
        {
            this.updateframe++;
            if (this.framelist != null)
            {
                if (this.frame == this.framelist.length - 1)
                    this.animfinished = true;
            }
            if (this.updateframe > 10)
            {
                this.frame++;
                this.updateframe = 0;
            }
        }
        else
        {
            this.frame = 0; 
            this.animfinished = false;
        }    
        super.update();
    }
    resetPosition()
    {
        this.pos.x = canvas.width/2;
        this.pos.y = canvas.height/2;

        if (getRandomNumber(0, 2) == 0)
            this.vel.y = this.speed;
        else
            this.vel.y = -1 * this.speed;       

        if (getRandomNumber(0, 2) == 0)
            this.vel.x =      this.speed;
        else
            this.vel.x = -1 * this.speed;
    }
    killSelf()
    {
        this.setCamera(null);
        for (var i = 0; i < viewports.length; i++)
        {
            if (viewports[i].followme == this)
            {
                viewports[i].followme = null;
                viewports.splice(i, 1);
            }
        }
        for (var i = 0; i < pucks.length; i++)
        {
            if (this == pucks[i])
            {
                pucks.splice(i, 1);
                break;
            }
        }
        super.killSelf();
    }
}