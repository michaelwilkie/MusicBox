class Level
{
    constructor(src)
    {
        this.width = 0;
        this.height = 0;
        this.bg_img = null;
        if (src != null)
        {
            this.bg_img = new Image();
            this.bg_img.src = src;
            
            var temp = this;
            this.bg_img.onload = function()
            {
                // 'this' now refers to bg_img in these 
                // inner brackets, not a reference to Level
                // not to be confused with Level.width/height
                temp.setDimensions(this.width, this.height);
            };
        }
        else
        {
            this.width = 10000;
            this.height = 10000;
        }
    }
    setWidth(width)
    {
        this.width = width;
    }
    setHeight(height)
    {
        this.height = height;
    }
    setDimensions(width, height)
    {
        this.setWidth(width);
        this.setHeight(height);
    }
    draw(camera)
    {
        if (this.bg_img != null)
        {
            ctx.drawImage(this.bg_img, camera.x, camera.y, camera.width, camera.height, camera.screenpartitionx, camera.screenpartitiony, camera.width, camera.height);
        }
        else
        {
            ctx.fillStyle = "gray";
            for (var i = camera.x; i < camera.x + camera.width; i+=GRID_TIGHTNESS)
            {
                var from = {x: i - camera.x + camera.screenpartitionx,
                            y: 0 - camera.y + camera.screenpartitiony};
                var to   = {x: i - camera.x + camera.screenpartitionx,
                            y: camera.height + camera.screenpartitiony};
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
            
            for (var i = camera.y; i < camera.y + camera.height; i+=GRID_TIGHTNESS)
            {
                var from = {x: 0 - camera.x + camera.screenpartitionx,
                            y: i - camera.y + camera.screenpartitiony};
                var to   = {x: camera.width + camera.screenpartitionx,
                            y: i - camera.y + camera.screenpartitiony};
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
        }
    }
}