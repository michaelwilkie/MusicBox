//////////////////////////////////////////////////////
// musicbox_func.js                                 //
//     This file contains most of the functionality //
//     that doesn't already come with class objects //
//////////////////////////////////////////////////////

////////////////////////////////////
// flags to enable debug messages //
////////////////////////////////////
var DEBUG_MSGS = false; // must be enabled to see any other type of debug message
var TREE_DEBUG_MSGS = true;
var CAMERA_DEBUG_MSGS = false;
var MEDIA_SRC = 'media/';
var PIANO_SRC = 'media/piano/';
var GRID_TIGHTNESS = 32; // tightens the grid

var note_table = ["a0", "bb0", "b0", "c1", "db1", "d1", "eb1", "e1", "f1", "gb1", "g1", "ab1",
                  "a1", "bb1", "b1", "c2", "db2", "d2", "eb2", "e2", "f2", "gb2", "g2", "ab2",
                  "a2", "bb2", "b2", "c3", "db3", "d3", "eb3", "e3", "f3", "gb3", "g3", "ab3",
                  "a3", "bb3", "b3", "c4", "db4", "d4", "eb4", "e4", "f4", "gb4", "g4", "ab4",
                  "a4", "bb4", "b4", "c5", "db5", "d5", "eb5", "e5", "f5", "gb5", "g5", "ab5",
                  "a5", "bb5", "b5", "c6", "db6", "d6", "eb6", "e6", "f6", "gb6", "g6", "ab6",
                  "a6", "bb6", "b6", "c7", "db7", "d7", "eb7", "e7", "f7", "gb7", "g7", "ab7",
                  "a7", "bb7", "b7", "c8", "db8"];

// Takes a note and generates a unique color for it
// Duplicate notes use the same color
var colormap = new Map();

////////////////////////////////////////////////////////////////////////
//                          getRandomColor                            //
// Function:                                                          //
//     Takes a note as a parameter                                    //
//     Maps it to a unique color                                      //
//     Duplicates are disarded and return the same color              //
// Return value:                                                      //
//     string containing html color code                              //
// Adapted from:                                                      //
// https://stackoverflow.com/questions/1484506/random-color-generator //
////////////////////////////////////////////////////////////////////////
function getRandomColor(note) 
{
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) 
    {
        color += letters[Math.floor(Math.random() * 16)];
    }
    if (!colormap.has(note))
    {
        colormap.set(note, color);
        return color;
    }
    else
    {
        return colormap.get(note);
    }
}
///////////////////////////////////////////////////
//                  smallerGrid                  //
// Function:                                     //
//     Shrinks GRID_TIGHTNESS by 2 unless it's 1 //
//     Can't really draw gridlines on subpixels  //
// Return value:                                 //
//     none                                      //
///////////////////////////////////////////////////
function smallerGrid()
{
    if (GRID_TIGHTNESS == 1)
        return;
    GRID_TIGHTNESS /= 2;
    updateGridDisplay();
}
///////////////////////////////////////////////////
//                  biggerGrid                   //
// Function:                                     //
//     Doubles GRID_TIGHTNESS                    //
//     No limit, unlike the smallerGrid function //
// Return value:                                 //
//     none                                      //
///////////////////////////////////////////////////
function biggerGrid()
{
    GRID_TIGHTNESS *= 2;
    updateGridDisplay();   
}
/////////////////////////////////////////////////////
//               updateGridDisplay                 //
// Function:                                       //
//     Fills in the Grid Size text field on the UI //
// Return value:                                   //
//     none                                        //
/////////////////////////////////////////////////////
function updateGridDisplay()
{
    $("#gridlabel").text(GRID_TIGHTNESS);
}
///////////////////////////////////////////////////////////
//                        save                           //
// Function:                                             //
//     Turns entlist into a json string and leaves it in //
//     the Level Data text area                          //
// Return value:                                         //
//     none                                              //
///////////////////////////////////////////////////////////
function save()
{
    var output_string = "";
    for (var i = 0; i < entlist.length; i++)
    {
        if (entlist[i] instanceof MusicBox)
        {
            output_string += "MusicBox" + "\n";
            output_string += entlist[i].pos.x + "\n";
            output_string += entlist[i].pos.y + "\n";
            output_string += entlist[i].note + "\n";
        }
        else if (entlist[i] instanceof PuckSpawner)
        {
            output_string += "PuckSpawner" + "\n";
            output_string += entlist[i].pos.x + "\n";
            output_string += entlist[i].pos.y + "\n";
        }
    }
    $("#leveldata_textarea").val(output_string);
}
////////////////////////////////////////////////////////////
//                         load                           //
// Function:                                              //
//     Takes the string from the Level Data text area and //
//     loads it into the entlist array                    //
// Return value:                                          //
//     none                                               //
////////////////////////////////////////////////////////////
function load()
{
    entlist = [];
    var leveldata = $('#leveldata_textarea').val().split('\n');
    var type = "";
    var reserved = false;
    var errordetected = false;
    for (var i = 0; i < leveldata.length;)
    {
        type = leveldata[i];
        i++;
        if (DEBUG_MSGS) console.log(type);
        if (type == "MusicBox")
        {
            var x = 0;
            var y = 0;
            var note = "";
            x = Number(leveldata[i]);
            i++;
            y = Number(leveldata[i]);
            i++;
            note = leveldata[i];
            i++;
            addMusicBox(x, y, note);
        }
        else if (type == "PuckSpawner")
        {
            var x = 0;
            var y = 0;
            x = Number(leveldata[i]);
            i++;
            y = Number(leveldata[i]);
            i++;
            addPuckSpawner(new Puck(x, y, 32, 32, 5, 5, MEDIA_SRC + "circles2.png", [2,3,4,5,4,3,2]));
        }
    }
    if (errordetected)
    {
        alert("Malformed level data\nProgram will attempt to load it anyways");
    }
}
////////////////////////////////////////
//              deleteAll             //
// Function:                          //
//     Deletes all entities on screen //
// Return value:                      //
//     none                           //
////////////////////////////////////////
function deleteAll()
{
    if (confirm("Are you sure you want to delete everything?"))
    {
        selectedentity = null;
        mouseselectedentity = null;
        for (var i = 0; entlist.length != 0; i++)
        {
            entlist[i].killSelf();
            i--;
        }
    }
}
////////////////////////////////////////////////////
//                deleteSelection                 //
// Function:                                      //
//     Deletes entity currently selected by mouse //
// Return value:                                  //
//     none                                       //
////////////////////////////////////////////////////
function deleteSelection()
{
    // did I actually select anything?
    if (selectedentity != null)
    {
        mouseselectedentity = null;
        selectedentity.killSelf();
        selectedentity = null;
        populateObjectInfo(); // update UI with blank space
    }
}
/////////////////////////////////////////////////////
//                 copySelection                   //
// Function:                                       //
//     Duplicates the entity selected by the mouse //
// Return value:                                   //
//     none                                        //
/////////////////////////////////////////////////////
function copySelection()
{
    // did I actually select anything?
    if (selectedentity != null)
    {
        if (selectedentity instanceof PuckSpawner)
        {
            // copy all the data from selected entity
            mouseselectedentity = new PuckSpawner(new Puck(selectedentity.pos.x, selectedentity.pos.y, 32, 32, 5, 5, MEDIA_SRC + "circles2.png", [2,3,4,5,4,3,2]));
            // the newly copied item is now the current selected entity
            selectedentity = mouseselectedentity;
        }
        else if (selectedentity instanceof MusicBox)
        {
            // copy all the data from selectedentity
            mouseselectedentity = new MusicBox(selectedentity.pos.x, 
                                               selectedentity.pos.y,
                                               selectedentity.w,
                                               selectedentity.h,
                                               selectedentity.imgsrc,
                                               selectedentity.framelist,
                                               selectedentity.soundsrc,
                                               selectedentity.note);
            // the newly copied item is now the current selected entity
            selectedentity = mouseselectedentity;
        }
    }
}
//////////////////////////////////////////////////////////////
//                      increasePitch                       //
// Function:                                                //
//     Increases the pitch of selectedentity by a half step //
// Return value:                                            //
//     none                                                 //
//////////////////////////////////////////////////////////////
function increasePitch()
{
    if (selectedentity != null)
    {
        for (var i = 0; i < note_table.length - 1; i++)
        {
            if (note_table[i] == selectedentity.note)
            {
                selectedentity.note = note_table[i + 1];
                selectedentity.color = getRandomColor(selectedentity.note);
                selectedentity.originalcolor = selectedentity.color;
                break;
            }
        }
        createjs.Sound.play(selectedentity.note);
    }
}
//////////////////////////////////////////////////////////////
//                      decreasePitch                       //
// Function:                                                //
//     Decreases the pitch of selectedentity by a half step //
// Return value:                                            //
//     none                                                 //
//////////////////////////////////////////////////////////////
function decreasePitch()
{
    if (selectedentity != null)
    {
        for (var i = 1; i < note_table.length; i++)
        {
            if (note_table[i] == selectedentity.note)
            {
                selectedentity.note = note_table[i - 1];
                selectedentity.color = getRandomColor(selectedentity.note);
                selectedentity.originalcolor = selectedentity.color;
                break;
            }
        }
        createjs.Sound.play(selectedentity.note);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
//                                      submitInfo                                         //
// Function:                                                                               //
//     Gets the text from the Object Info fields and modifies the entity selected by mouse //
// Return value:                                                                           //
//     none                                                                                //
/////////////////////////////////////////////////////////////////////////////////////////////
function submitInfo()
{
    var errordetected = false;
    var errorstring = "";
    var note     =        $("#noteinput"    ).val() ;
    var octave   = Number($("#octaveinput"  ).val());
    var duration = Number($("#durationinput").val());
    var x        = Number($("#xinput"       ).val());
    var y        = Number($("#yinput"       ).val());
    var xv       = Number($("#xvel"         ).val());
    var yv       = Number($("#yvel"         ).val());

    if (x < 0 || x > level.width)
    {
        errorstring += "Invalid coordinate x: " + x + "\n";
        errordetected = true;
    }
    if (y < 0 || y > level.height)
    {
        errorstring += "Invalid coordinate y: " + y + "\n";
        errordetected = true;
    }
    if (selectedentity instanceof MusicBox)
    {
        if (note.length < 1 || note.length > 2)
        {
            errorstring += "Invalid note: " + note + "\n";
            errordetected = true;
        }
        if (duration < 0)
        {
            errorstring += "Invalid duration: " + duration + "\n";
            errordetected = true;
        }
        if (octave < 1 || octave > 7)
        {
            errorstring += "Invalid octave: " + octave + "\n";
            errordetected = true;
        }
    }

    if (errordetected)
    {
        alert(errorstring);
    }
    else
    {
        if (selectedentity instanceof MusicBox)
        {
            selectedentity.pos.x = x * GRID_TIGHTNESS; // snap object to grid lines with GRID_TIGHTNESS
            selectedentity.pos.y = y * GRID_TIGHTNESS; // snap object to grid lines with GRID_TIGHTNESS
            selectedentity.note = note + octave;       // put together the note and the octave
            selectedentity.duration = duration;
            selectedentity.color = getRandomColor(note + octave); // generate a new color for this note if it hasn't been created yet
            selectedentity.originalcolor = selectedentity.color;
            createjs.Sound.play(selectedentity.note); // play a test sound
        }
        else
        {
            selectedentity.spawnee.pos.x = x * GRID_TIGHTNESS; // snap object to grid lines with GRID_TIGHTNESS
            selectedentity.spawnee.pos.y = y * GRID_TIGHTNESS; // snap object to grid lines with GRID_TIGHTNESS
            selectedentity.spawnee.setVelocity(xv, yv);
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////
//                             populateObjectInfo                              //
// Function:                                                                   //
//     Creates HTML elements containing information about the selected entity  //
//     Creates buttons and input boxes for modification to the selected entity //
// Return value:                                                               //
//     none                                                                    //
/////////////////////////////////////////////////////////////////////////////////
function populateObjectInfo()
{
    $("#objinfo").empty(); // clear everything to refill this field
    
    // did I actually select anything?
    if (selectedentity != null)
    {
        // I selected a MusicBox
        if (selectedentity instanceof MusicBox)
        {
            var note;
            var octave;
            // Do I have a flat or a natural note?
            if (selectedentity.note.length > 2)
            {
                // flat note
                note     = selectedentity.note[0] + selectedentity.note[1];
                octave   = selectedentity.note[2];
            }
            else
            {
                // natural note
                note     = selectedentity.note[0];
                octave   = selectedentity.note[1];
            }

            // play test sound
            createjs.Sound.play(note + octave);

            var duration = selectedentity.duration;
            var x = (selectedentity.pos.x / GRID_TIGHTNESS); /* snap to grid */
            var y = (selectedentity.pos.y / GRID_TIGHTNESS); /* snap to grid */

            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>Note</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='noteinput'></input></li>");
            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>Octave</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='octaveinput'></input></li>");
            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>Duration</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='durationinput'></input></li>");
            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>x</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='xinput'></input></li>");
            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>y</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='yinput'></input></li>");
            $("#objinfo").append("<li class='list-group-item'>"
                + "<button class='btn btn-block btn-success' id='submitbutton' onclick='submitInfo()' ontouchstart='submitInfo()'>Modify</button></li>");
            
            $("#noteinput").val(note);
            $("#octaveinput").val(octave);
            $("#durationinput").val(duration);
            $("#xinput").val(x);
            $("#yinput").val(y);  
        }
        else
        {
            // I selected a Ball
            var x = (selectedentity.pos.x / GRID_TIGHTNESS); /* snap to grid */
            var y = (selectedentity.pos.y / GRID_TIGHTNESS); /* snap to grid */
            var vx = selectedentity.spawnee.vel.x;
            var vy = selectedentity.spawnee.vel.y;

            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>x</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='xinput'></input></li>");

            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>y</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='yinput'></input></li>");

            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>x velocity</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='xvel'></input></li>");
            
            $("#objinfo").append("<li class='list-group-item'>"
                + "<span class='input-group-text' id='inputGroup-sizing-sm'>y velocity</span>" 
                + "<input type='text' class='form-control' aria-label='Small' aria-describedby='inputGroup-sizing-sm' id='yvel'></input></li>");

            $("#objinfo").append("<li class='list-group-item'>"
                + "<button class='btn btn-block btn-success' id='submitbutton' onclick='submitInfo()' ontouchstart='submitInfo()'>Modify</button></li>");

            $("#xinput").val(x);
            $("#yinput").val(y);      
            $("#xvel").val(vx);
            $("#yvel").val(vy);      
        }
    }
    else
    {
        $("#objinfo").append("<li class='list-group-item' style='text-align: center'><h4>Object Info</h4></li>");
    }
}
//////////////////////////////////////////////////////////////
//                     entlistHasPuck()                     //
// Function:                                                //
//     Returns true or false if the entlist contains a puck //
// Return value:                                            //
//     boolean                                              //
//////////////////////////////////////////////////////////////
function entlistHasPuck()
{
    entlist.forEach(function(ent)
    {
        if (ent instanceof Puck)
        {
            return true;
        }
    });
    return false;
}
//////////////////////////////////////
//          toggleGravity           //
// Function:                        //
//     Toggle gravity for all balls //
// Return value:                    //
//     none                         //
//////////////////////////////////////
function toggleGravity()
{
    console.log(gravityenabled);
    gravityenabled = !gravityenabled;
    if (gravityenabled)
    {
        document.getElementById("gravitybutton").className = "btn btn-block btn-danger";
    }
    else
    {
        document.getElementById("gravitybutton").className = "btn btn-block btn-success";
    }
}
////////////////////////////////////////////////////////////////////////////////
//                                toggleplay                                  //
// Function:                                                                  //
//     Toggles whether the balls will start moving around screen or edit mode //
// Return value:                                                              //
//     none                                                                   //
////////////////////////////////////////////////////////////////////////////////
function toggleplay()
{
    // remove any moving balls on screen
    for (var i = 0; i < entlist.length; i++)
    {
        if (entlist[i] instanceof Puck)
        {
            entlist[i].killSelf();
            i--;
        }
    }
    // I'm in edit mode
    if (levelmode == LevelModeEnum.EDIT)
    {
        // Time go to play mode
        levelmode = LevelModeEnum.PLAY;
        document.getElementById("modebutton").innerHTML = "Edit";
        // Spawn all balls
        entlist.forEach(function(ent)
        {
            if (ent instanceof PuckSpawner)
            {
                ent.spawn();
            }
        });
    }
    else
    {
        levelmode = LevelModeEnum.EDIT;
        document.getElementById("modebutton").innerHTML = "Play";
    }
}
/////////////////////////////////////////////////////////////////////
//                        selectMusicBox                           //
// Function:                                                       //
//     Creates a music box to follow mouse to place it on the grid //
// Return value:                                                   //
//     none                                                        //
/////////////////////////////////////////////////////////////////////
function selectMusicBox()
{
    // only place stuff in edit mode
    if (levelmode == LevelModeEnum.EDIT)
    {
        // did I already select a music box?
        if (mouseselectedentity instanceof MusicBox)
        {
            // unselect the button
            mouseselectedentity = null;
            document.getElementById("musicboxbutton").className = "btn btn-block";
        }
        else
        {
            // clicking the music box button
            mouseselectedentity = new MusicBox(0, 0, 64, 64, MEDIA_SRC + "spring-aa.png", [0,1,2,3,4], "none", "c4");
            selectedentity = mouseselectedentity;
            document.getElementById("musicboxbutton").className = "btn btn-block btn-success";
            document.getElementById("ballbutton").className = "btn btn-block";
        }
    }
}
//////////////////////////////////////////////////
//                  selectBall                  //
// Function:                                    //
//     Creates a ball to be placed by the mouse //
// Return value:                                //
//     none                                     //
//////////////////////////////////////////////////
function selectBall()
{
    // only place stuff in edit mode
    if (levelmode == LevelModeEnum.EDIT)
    {
        // did I already select the ball?
        if (mouseselectedentity instanceof Puck)
        {
            // unselect the button
            mouseselectedentity = null;
            document.getElementById("ballbutton").className = "btn btn-block";
        }
        else
        {
            // clicking the ball button
            mouseselectedentity = new Puck(0, 0, 32, 32, 5, 5, MEDIA_SRC + "circles2.png", [0,1,2,3,4]);
            selectedentity = mouseselectedentity;
            document.getElementById("ballbutton").className = "btn btn-block btn-success";
            document.getElementById("musicboxbutton").className = "btn btn-block";
        }
    }
}
//////////////////////////////////////////////////////////////////////
//                              addfiller                           //
// Function:                                                        //
//     Copies count number of strs and then returns this new string // 
// Return value:                                                    //
//     string                                                       //
//////////////////////////////////////////////////////////////////////
function addfiller(str, count)
{
    if (count < 0)
        return "";
    var result = "";
    while(count < 0)
    {
        result += str;
    }
    return result;
}
///////////////////////////////////////////////////////////////////////////////////
//                                getMousePos                                    //
// Function:                                                                     //
//     Gets the mouse position relative to the canvas                            //
// Return value:                                                                 //
//     object: {x, y}                                                            //
// Source:                                                                       //
// https://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/ //
///////////////////////////////////////////////////////////////////////////////////
function getMousePos(e) 
{
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                             invertColor                                                       //
// Function:                                                                                                     //
//     Inverts the color of a hex value                                                                          //
// Return value:                                                                                                 //
//     string value containing html hex color                                                                    //
// Source:                                                                                                       //
// https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function invertColor(hex, bw) 
{
    if (hex.indexOf('#') === 0) 
    {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) 
    {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) 
    {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) 
    {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
//////////////////////////////////////////////////
//                    padZero                   //
// Function:                                    //
//     Helper function to invertColor           //
// Return value:                                //
//     string containing zeros for a hex string //
// Source:                                      //
//     Same source from invertColor function    //
//////////////////////////////////////////////////
function padZero(str, len) 
{
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}
////////////////////////////////////////////////////////////////////////////////
//                            allImagesLoaded                                 //
// Function:                                                                  //
//     Returns true or false if all images that need loading have been loaded //
// Return value:                                                              //
//     boolean                                                                //
////////////////////////////////////////////////////////////////////////////////
function allImagesLoaded()
{
    if (level.bg_img != null)
        if (!level.bg_img.complete)
            return false;
    for (var i = 0; i < entlist.length; i++)
        if (entlist[i].img != null)
            if (!entlist[i].img.complete)
                return false;
    return true;
}
///////////////////////////////
// Modes of playing this app //
///////////////////////////////
var LevelModeEnum = {
    PLAY : 0, // play mode, watch balls on the screen bounce on boxes
    EDIT : 1, // edit mode, place balls and boxes on the screen
    ERROR: 2  // debug/error
}
//////////////////////////////////////////////
// Sides an object can collide with another //
//////////////////////////////////////////////
var SideEnum = {
    UP   : 0,
    DOWN : 1,
    RIGHT: 2,
    LEFT : 3,
    ERROR: 4
}
////////////////////////////////////////
// String version of above enumerator //
////////////////////////////////////////
var SideString = [
    "up",
    "down",
    "right",
    "left",
    "error"
];
//////////////////////////////////////////////////////////////////////////////////////
//                           checkSide                                              //
// checkSide(a,b) :  return what side entity A is to entity B                       //
//                                                                                  //
//   +-----+                                                                        //
//   |     |   +---+                                                                //
//   |  a  |   | b |                                                                //
//   |     |   +---+                                                                //
//   +-----+                                                                        //
//                                                                                  //
// In this illustration, a is to the left of b                                      //
// so, in this case, the function will return SideEnum.LEFT                         //
//////////////////////////////////////////////////////////////////////////////////////
function checkSide(a, b)
{
    if (!(a instanceof Entity))
        return SideEnum.ERROR;
    if (!(b instanceof Entity))
        return SideEnum.ERROR;
    
    if (a.pos.x + a.w > b.pos.x + b.w && a.pos.x > b.pos.x + b.w) return SideEnum.LEFT ;
    if (b.pos.x + b.w > a.pos.x + a.w && b.pos.x > a.pos.x + a.w) return SideEnum.RIGHT;
    if (a.pos.y + a.h > b.pos.y + b.h && a.pos.y > b.pos.y + b.h) return SideEnum.DOWN ;
    if (b.pos.y + b.h > a.pos.y + a.h && b.pos.y > a.pos.y + a.h) return SideEnum.UP   ;
    
    return SideEnum.ERROR;
}
//////////////////////////////////////////////////
//             checkPointCollision              //
// Function:                                    //
//     Checks whether point is inside rectangle //
// Return value:                                //
//     boolean                                  //
//////////////////////////////////////////////////
function checkPointCollision(rectangle, point)
{
    if (rectangle == null) return false;
    if (point     == null) return false;
    
    return point.x > rectangle.pos.x && point.x < rectangle.pos.x + rectangle.w
        && point.y > rectangle.pos.y && point.y < rectangle.pos.y + rectangle.h;

}
//////////////////////////////////////////////////////////////////////////////////////
//                               checkCollision                                     //
// Function:                                                                        //
//     Checks whether two rectangles collide                                        //
// Return value:                                                                    //
//     boolean                                                                      //
// Source:                                                                          //
// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection //
//////////////////////////////////////////////////////////////////////////////////////
function checkCollision(a, b)
{
    if (!(a instanceof Entity))
        return false;
    if (!(b instanceof Entity))
        return false;
 
    var rect1 = {x: a.pos.x, y: a.pos.y, width: a.w, height: a.h}
    var rect2 = {x: b.pos.x, y: b.pos.y, width: b.w, height: b.h}
 
    if (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y)
    {
        return true;
    }
    return false;   
}
//////////////////////////////////////////////////////////////////////////////////////
//                             checkCameraCollision                                 //
// Function:                                                                        //
//     Checks whether camera is inside rectangle                                    //
// Return value:                                                                    //
//     boolean                                                                      //
// Source:                                                                          //
// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection //
//////////////////////////////////////////////////////////////////////////////////////
function checkCameraCollision(a, b)
{
    if (!(a instanceof Camera))
    {
        throw Error("Invalid camera argument, checkCameraCollision recevied" + (typeof a));
    }
    var rect1 = {x: a.x, y: a.y, width: a.width, height: a.height}
    var rect2 = {x: b.pos.x, y: b.pos.y, width: b.w, height: b.h}
 
    if (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y)
    {
        return true;
    }
    return false;   
}
////////////////////////////////////////////////////////////////////
//                      getLevelDimensions                        //
// Function:                                                      //
//     Retrieves an object containing the dimensions of the level //
//     If the level has no background, it uses the default size   //
// Return value:                                                  //
//     object {width, height}                                     //
////////////////////////////////////////////////////////////////////
function getLevelDimensions()
{
    if (level.bg_img != null)
    {
        return {width: level.bg_img.width, height: level.bg_img.height};
    }
    else
    {
        return {width: level.width, height: level.height};
    }
}
//////////////////////////////////////////////////////////////////
//                   calculateCameraSizes                       //
// Function:                                                    //
//     Resizes viewports based on the number of balls on screen //
// Return value:                                                //
//     none                                                     //
//////////////////////////////////////////////////////////////////
function calculateCameraSizes()
{
    // no cameras to render or calculate
    if (viewports.length < 1)
    {
        return;
    }
    // just one will get the entire canvas for rendering
    if (viewports.length == 1)
    {
        viewports[0].screenpartitionx = 0;
        viewports[0].screenpartitiony = 0;
        viewports[0].width  = canvas.width ;
        viewports[0].height = canvas.height;
        return;
    }
    // draw everything in a n*n square fashion
    var square = 2;
    while (square * square <= viewports.length - 1)
    {
        square++;
    }
    if (DEBUG_MSGS) console.log(square);
    var dwidth  = canvas.width  / square;
    var dheight = canvas.height / square;
    for (var i = 0; i < square; i++)
    {
        for (var j = 0; j < square; j++)
        {
            var cam = viewports[i + j * square];
            if (cam == null)
                break;
            cam.screenpartitionx = i * dwidth ;
            cam.screenpartitiony = j * dheight;
            cam.width  = dwidth ;
            cam.height = dheight;
        }
    }
}
///////////////////////////////////////////////////////////////////
//                       addPuckSpawner                          //
// Function:                                                     //
//     Adds a PuckSpawner to the screen                          //
//     This will create a ball when the "Play" button is clicked //
// Return value:                                                 //
//     PuckSpawner object                                        //
///////////////////////////////////////////////////////////////////
function addPuckSpawner(ent)
{
    var obj = new PuckSpawner(ent);
    entlist.push(obj);
    return obj;
}
///////////////////////////////////////////////////////////////////
//                       addPuckAtMouse                          //
// Function:                                                     //
//     Adds a Puck to the screen at mouse                        //
// Return value:                                                 //
//     none                                                      //
///////////////////////////////////////////////////////////////////
function addPuckAtMouse(e)
{
    var x = mousepos.x;
    var y = mousepos.y;
    var vx = (mousestartpos.x - mousepos.x) / 10;
    var vy = (mousestartpos.y - mousepos.y) / 10;
    addPuck(x - 16, y - 16, vx, vy);
}
///////////////////////////////////////////////////////////////////
//                           addPuck                             //
// Function:                                                     //
//     Adds a Puck to the screen at the given position           //
//     Pushes this new object to entity list                     //
//     Pushes this new object to puck list                       //
// Return value:                                                 //
//     Puck object                                               //
///////////////////////////////////////////////////////////////////
function addPuck(x, y, vx, vy)
{
    var obj = new Puck(x, y, 32, 32, vx, vy, MEDIA_SRC + "circles2.png", [2,3,4,5,4,3,2]);
    pucks.push(obj);
    entlist.push(obj);
    obj.setCamera(addCamera(obj));
    return obj;
}
///////////////////////////////////////////////////////////////////
//                          addWall                              //
// Function:                                                     //
//     Adds a Wall to the screen at the given position           //
//     Pushes this new object to entity list                     //
// Return value:                                                 //
//     Wall object                                               //
///////////////////////////////////////////////////////////////////
function addWall(x, y)
{
    var obj = new Wall(x, y, 4, 4)
    entlist.push(obj);
    return obj;
}
///////////////////////////////////////////////////////////////////
//                          addWall                              //
// Function:                                                     //
//     Adds a MusicBox to the screen at the given position       //
//     Pushes this new object to entity list                     //
// Return value:                                                 //
//     MusicBox object                                           //
///////////////////////////////////////////////////////////////////
function addMusicBox(x, y, note, duration=0.25)
{
    var obj = new MusicBox(x, y, 64, 64, MEDIA_SRC + "spring-aa.png", [0,1,2,3,4], "none", note, duration);
    entlist.push(obj);
    return obj;
}
///////////////////////////////////////////////////////////////////////////
//                          addLevel                                     //
// Function:                                                             //
//     Creates a level object and loads background img from src if given //
// Return value:                                                         //
//     Level object                                                      //
///////////////////////////////////////////////////////////////////////////
function addLevel(src)
{
    return new Level(src);
}
/////////////////////////////////////////////////////////////////////////////////////
//                                 addCamera                                       //
// Function:                                                                       //
//     Creates a camera and takes a Puck as a parameter so it can follow it around //
// Return value:                                                                   //
//     Camera object                                                               //
/////////////////////////////////////////////////////////////////////////////////////
function addCamera(followme)
{
    var temp = new Camera(followme);
    viewports.push(temp);
    calculateCameraSizes();
    return temp;
}
//////////////////////////////////////////////////////////////////////////////////////////
//                                 initializeSounds                                     //
// Function:                                                                            //
//     Initializes the piano array and registers all sounds from the media/piano folder //
// Return value:                                                                        //
//     none                                                                             //
//////////////////////////////////////////////////////////////////////////////////////////
function initializeSounds()
{
    var keys = ["B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb"];
    for (var i = 1; i <= 7; i++)
    {
        for (var j = 0; j < 12; j++)
        {
            var note = {id: keys[j].toLowerCase() + i.toString(10), src: PIANO_SRC + keys[j] + i.toString(10) + ".mp3"}
            if (DEBUG_MSGS) console.log(note.id);
            piano.push(note);
            createjs.Sound.registerSound(note.src, note.id);
        }
    }
}

var allPianoKeysLoaded = false;
var countLoadedPianoKeys = 0;

// https://www.createjs.com/docs/soundjs/classes/Sound.html
function loadHandler(event) 
{
    countLoadedPianoKeys++;
    // This is fired for each sound that is registered.
    if (countLoadedPianoKeys >= piano.length)
    {
        // Play C Major chord on load
        createjs.Sound.play("c4");
        createjs.Sound.play("e4");
        createjs.Sound.play("g4");
        main();
    }
}
// Canvas objects
var canvas;
var ctx;

// mouse variables
var mousepos      = {x: 0, y: 0};
var mousestartpos = {x: 0, y: 0};
var mousedif      = {x: 0, y: 0};
var mousedragbox  = {x: 0, y: 0, w: 0, h: 0};
var mdown         = false;
var MOUSE_DEBUG_MODE = false;
var mouseselectedentity = null; // for drag and drop
var selectedentity = null; // for displaying to html

// list containing all .aiff sound file objects
var piano = [];

// Object lists
var entlist   = [];
var pucks     = [];
var viewports = []; // list of Camera objects
var gravityenabled = false;

// Level data
var level;
var levelmode;

// all images loaded flag
var imagesLoaded = false;

// Button presses
var isUpArrowPressed    = false;
var isDownArrowPressed  = false;
var isRightArrowPressed = false;
var isLeftArrowPressed  = false;
var isSpacePressed      = false;
var isMPressed          = false;
var lastMPress          = false;
var isEPressed          = false;
var isSPressed          = false;
var isFPressed          = false;

window.onkeydown = function(e)
{
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 32) isSpacePressed     = true;
    if (key == 37) isLeftArrowPressed = true;
    if (key == 38) isUpArrowPressed   = true;
    if (key == 39) isRightArrowPressed= true;
    if (key == 40) isDownArrowPressed = true;
    if (key == 46) deleteSelection();
    if (key == 67) copySelection();
    if (key == 77) selectMusicBox();
    if (key == 80) selectBall();
    if (key == 83) decreasePitch();
    if (key == 87) increasePitch();
}
 
window.onkeyup = function(e)
{
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 32) isSpacePressed     = false;
    if (key == 37) isLeftArrowPressed = false;
    if (key == 38) isUpArrowPressed   = false;
    if (key == 39) isRightArrowPressed= false;
    if (key == 40) isDownArrowPressed = false;
    if (key == 77) isMPressed         = false;
    if (key == 83) isSPressed         = false;  
}

$(document).ready(function()
{
    initCreateJS();
});

function main()
{
    canvas = $("#myCanvas")[0];
    ctx = $("#myCanvas")[0].getContext("2d");    

    levelmode = LevelModeEnum.EDIT;

    var playercamera = new Camera();
    playercamera.initialize(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', function (event)
    {
        mousestartpos = getMousePos(event);
        mousepos = mousestartpos;
        mdown = true;

        var foundobject = false;
        for (var i = 0; i < entlist.length; i++)
        {
            var relativelocation = {x: mousepos.x + playercamera.x, y: mousepos.y + playercamera.y};
            if (checkPointCollision(entlist[i], relativelocation))
            {
                mousedragbox = null;
                mouseselectedentity = entlist[i];
                mousedif = {x: mousepos.x - mouseselectedentity.pos.x, y: mousepos.y - mouseselectedentity.pos.y};
                selectedentity = mouseselectedentity;
                foundobject = true;
                break;
            }
        }
        if (!foundobject)
        {
            selectedentity = null;
            mousedragbox = {x: mousestartpos.x -  playercamera.x, y: mousestartpos.y - playercamera.y,
                            w: mousepos.x      - mousestartpos.x, h: mousepos.y      - mousestartpos.y};
        }
        populateObjectInfo();
    });
    canvas.addEventListener('mousemove', function (event)
    {
        mousepos = getMousePos(event);
        if (levelmode == LevelModeEnum.EDIT)
        {
            if (mouseselectedentity != null)
            {
                var ent = mouseselectedentity;
                ent.pos.x = Math.floor ((mousepos.x - mousedif.x) / GRID_TIGHTNESS) 
                    * GRID_TIGHTNESS 
                    + Math.floor ((playercamera.x + mousedif.x) / GRID_TIGHTNESS) 
                    * GRID_TIGHTNESS;
                ent.pos.y = Math.floor ((mousepos.y - mousedif.y) / GRID_TIGHTNESS) 
                    * GRID_TIGHTNESS 
                    + Math.floor ((playercamera.y + mousedif.y) / GRID_TIGHTNESS) 
                    * GRID_TIGHTNESS;
                if (ent instanceof PuckSpawner)
                {
                    ent.spawnee.pos = ent.pos;
                }
            }
            else
            {
                mousedragbox = {x: mousestartpos.x -  playercamera.x, y: mousestartpos.y - playercamera.y,
                                w: mousepos.x      - mousestartpos.x, h: mousepos.y      - mousestartpos.y};
            }
        }
        
    });
    canvas.addEventListener('mouseup', function (event)
    {
        if (levelmode == LevelModeEnum.EDIT)
        {
            entlist.forEach(function(ent)
            {
                if (mouseselectedentity == ent)
                {
                    document.getElementById("musicboxbutton").className = "btn btn-block";
                    document.getElementById("ballbutton").className = "btn btn-block";
                    selectedentity = mouseselectedentity;
                    mouseselectedentity = null;
                    return;
                }
            });
            if (mouseselectedentity instanceof Puck)
            {
                //addPuck(mouseselectedentity.pos.x, mouseselectedentity.pos.y, 5, 5);
                addPuckSpawner(new Puck(mouseselectedentity.pos.x, mouseselectedentity.pos.y, 32, 32, 5, 5, MEDIA_SRC + "circles2.png", [2,3,4,5,4,3,2]));
            }
            if (mouseselectedentity instanceof MusicBox)
            {
                addMusicBox(mouseselectedentity.pos.x, mouseselectedentity.pos.y, mouseselectedentity.note);
                document.getElementById("musicboxbutton").className = "btn btn-block";
                mouseselectedentity = null;
                selectedentity = null;
            }
            else
            {
                // no object was selected or one was just dropped
                //selectedentity = null;
            }
        }
        mdown = false;
    });

    $.ajax(
    {
        url : "/samples/bwv846.txt",
        dataType: "text",
        success : function (data) 
        {
            $("#leveldata_textarea").text(data);
            load();
        }
    });
    level = new Level(null/*MEDIA_SRC + "bg.png"*/);

    var Fps = 60;
    var nextadd = 0;

    var game = setInterval(function ()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.width);

        if (!imagesLoaded)
            imagesLoaded = allImagesLoaded();
        else
        {
            if (levelmode == LevelModeEnum.PLAY)
            {
                for (var i = 0; i < viewports.length; i++)
                {
                    level.draw(viewports[i]);
                }
                for (var i = 0; i < entlist.length; i++)
                {
                    for (var j = 0; j < viewports.length; j++)
                    {
                        entlist[i].draw(viewports[j]);
                    }
                }
                for (var i = 0; i < entlist.length; i++)
                {
                    entlist[i].update();
                }
                for (var i = 0; i < viewports.length; i++)
                {
                    viewports[i].update();
                }
                if (DEBUG_MSGS) console.log(levelmode);
            }
            else
            {
                if (isUpArrowPressed   ) { playercamera.moveUp   (); }
                if (isDownArrowPressed ) { playercamera.moveDown (); }
                if (isLeftArrowPressed ) { playercamera.moveLeft (); }
                if (isRightArrowPressed) { playercamera.moveRight(); }
                level.draw(playercamera);
                for (var i = 0; i < entlist.length; i++)
                {
                    entlist[i].draw(playercamera);
                }
                if (mdown && mousedragbox != null)
                {
                    var oldstyle = ctx.strokeStyle;
                    ctx.strokeStyle = "cyan";
                    ctx.strokeRect(mousedragbox.x, mousedragbox.y, mousedragbox.w, mousedragbox.h);
                    ctx.strokeStyle = oldstyle;
                }
                if (mouseselectedentity != null)
                    mouseselectedentity.draw(playercamera);
                if (DEBUG_MSGS) console.log(levelmode);
            }
         }
    }, 1000 / Fps);
}
 // TREE TESTING
    //var tree = new FourTree();
    //if (DEBUG_MSGS) console.log("WHAT?");
    //tree.push(addPuck(0, 0, 5, 5).camera);

    //tree.push(addPuck(250, 250, 5, 5).camera);
    //tree.push(addPuck(150, 250, 5, 5).camera);
 /*
            tree.iterateTree(function(node)
            {
                if (DEBUG_MSGS && CAMERA_DEBUG_MSGS) console.log("camera: " + node.camera.x + " " + node.camera.y + " " + node.camera.width + " " + node.camera.height);
                level.draw(node.camera);
            });
            tree.iterateTree(function(node1)
            {
                tree.iterateTree(function(node2)
                {
                    // followme is the name of the Puck object that each camera points to
                    node1.camera.followme.draw(node2.camera);
                });
            });
            tree.iterateTree(function(node)
            {
                node.camera.followme.update();
            });
            tree.iterateTree(function(node)
            {
                node.camera.update();
            });*/