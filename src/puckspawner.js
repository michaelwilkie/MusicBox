class PuckSpawner extends Entity
{
    constructor(obj)
    {
        super(obj.pos.x, obj.pos.y, obj.w, obj.h, obj.imgsrc, obj.framelist);
        this.spawnee = obj;
    }
    update() {}
    spawn()
    {
        if (this.spawnee instanceof Puck)
        {
            var p = addPuck(this.spawnee.pos.x, this.spawnee.pos.y, this.spawnee.vel.x, this.spawnee.vel.y);
            if (gravityenabled)
            {
                p.setGravity(0, 1);
            }
        }
    }
    draw(camera)
    {
        this.spawnee.draw(camera);
    }
}