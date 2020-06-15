class Camera
{
    // followme must have:
    // pos:
    //     x, y
    // and:
    //     width, height
    // fields defined for Camera to work properly
    constructor(followme=null)
    {
        this.followme = followme;
        this.width  = 0  ;
        this.height = 0  ;
        this.x      = 0  ;
        this.y      = 0  ;
        this.screenpartitionx = 0;
        this.screenpartitiony = 0;
        this.dx     = 5.5;
        this.dy     = 5.5;
        this.zoomx  = 1  ;
        this.zoomy  = 1  ;
    }
    setZoom(zoomx, zoomy)
    {
        ctx.scale(zoomx, zoomy);
        this.zoomx = zoomx;
        this.zoomy = zoomy;
    }
    moveUp()
    {
        if (this.y > 0)
            this.y -= this.dy;
        if (this.y < 0)
        {
            this.y = 0;
        }
    }
    moveDown()
    {
        var dim = getLevelDimensions();
        if (this.y + this.height < dim.height)
            this.y += this.dy;
        if (this.y + this.height > dim.height)
        {
            this.y = dim.height - this.height;
        }
    }
    moveRight()
    {
        var dim = getLevelDimensions();
        if (this.x + this.width < dim.width)
            this.x += this.dx; 
        if (this.x + this.width > dim.width)
        {
            this.x = dim.width - this.width;
        }
    }
    moveLeft()
    {
        if (this.x > 0)
            this.x -= this.dx;
        if (this.x < 0)
        {
            this.x = 0;
        }
    }
    initialize(x, y, width, height)
    {
        this.screenpartitionx = x;
        this.screenpartitiony = y;
        this.width  = width ;
        this.height = height;
    }
    update()
    {
        // Center the camera around the followme object  
        this.x = (this.followme.pos.x + this.followme.w / 2) - this.width  / 2;
        this.y = (this.followme.pos.y + this.followme.h / 2) - this.height / 2;

        // Keep the camera within bounds
        if (this.x < 0)                          this.x = 0;
        if (this.y < 0)                          this.y = 0;
        if (this.x > level.width  - this.width ) this.x = level.width  - this.width ;
        if (this.y > level.height - this.height) this.y = level.height - this.height;
    }
}