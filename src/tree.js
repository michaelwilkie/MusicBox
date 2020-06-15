

//
// This file is a failed attempt to use a quarternary tree to display all viewports
// It was promising but it was way more work than needed and difficult to debug
// also needed to meet deadline for contest
//
//


//////////////////////////////////////////////////////////////////////////////////////
// class                          FourTree                                          //
// Quarternary tree (tree with 4 branches)                                          //
// Needed to help me recursively split viewport into equally distributed partitions //
//                                                                                  //
//                               Node------camera                                   //
//                       ┌--------+--------┐                                        //
//                    first    second    third                                      //
//////////////////////////////////////////////////////////////////////////////////////
// class              Node                       //
//     camera:    camera object                  //
//     weight:    node data for tree diagnostics //
//     first :    first branch                   //
//     second:    second branch                  //
//     third :    third branch                   //
//     fourth:    fourth branch                  //
///////////////////////////////////////////////////
class Node
{
    constructor(camera)
    {
        this.camera    = camera;
        this.subregion = null  ;
    }
}
class RegionNode
{
    constructor(node=null)
    {
        this.weight = 1   ;
        this.height = 0   ;
        this.first  = node;
        this.second = null;
        this.third  = null;
        this.fourth = null;
    }
}
class FourTree
{
    constructor()
    {
        this.root = null;
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    //                                      push                                          //
    // Function:                                                                          //
    //     Adds camera to the tree                                                        //
    //     Tree will always put new object in the leftmost shallow node in the whole tree //
    // Return value:                                                                      //
    //     none                                                                           //
    ////////////////////////////////////////////////////////////////////////////////////////
    push(camera)
    {
        var node = new Node(camera);
        
        if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log(node);
        if (this.root == null)
        {
            var regionnode = new RegionNode(node);
            this.root = regionnode;
            this.updateCameras();
            return;
        }
        this._push(this.root, node);
        if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log("update cameras");
        this.updateCameras();
    }
    _push_subregion(current, node)
    {
        if (current.subregion == null)
        {
            current.subregion = new RegionNode(node);
        }
        else
        {
            this._push(current.region, node);
        }
    }
    //////////////////////////////////////////////////////////////
    //                          _push                           //
    // Function:                                                //
    //     Helper function for push.                            //
    //     Recursively traverses the tree until the next to     //
    //     last node is null                                    //
    //     Whichever has the lower weight is given the new node //
    //     Insertion is left node biased                        //
    // Return value:                                            //
    //     none                                                 //
    //////////////////////////////////////////////////////////////
    _push(currentsubregion, node)
    {
        if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log("in _push()");

        // push to the lightest node only
        // I reeeeaally don't want to figure out how to do tree rotations again
        var lightestnode = minimumWeightNode(currentsubregion);
        if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log("lightest node: " + lightestnode);
        if (lightestnode === undefined)
        {
            console.long(":( error ):");
        }
        if (lightestnode == 'first') 
        {
            // I'm at the bottom
            if (currentsubregion.first == null)
            {
                currentsubregion.first = node;
            }
            // There's more levels to keep searching
            else
            {
                this._push_subregion(currentsubregion.first, node);
            }
        }
        else if (lightestnode == 'second') 
        {
            // I'm at the bottom
            if (currentsubregion.second == null)
            {
                currentsubregion.second = node;
            }
            // There's more levels to keep searching
            else
            {
                this._push_subregion(currentsubregion.second, node);
            }
        }
        else if (lightestnode == 'third')
        {
            // I'm at the bottom
            if (currentsubregion.third == null)
            {
                currentsubregion.third = node;
            }
            // There's more levels to keep searching
            else
            {
                this._push_subregion(currentsubregion.third , node);
            }
        }
        //  FOURTREE
        else if (lightestnode == 'fourth')
        {
            // I'm at the bottom
            if (currentsubregion.fourth == null)
            {
                currentsubregion.fourth = node;
            }
            // There's more levels to keep searching
            else
            {
                this._push_subregion(currentsubregion.fourth , node);
            }
        }
        // Some error happened, I shouldn't reach this.
        else
        {
            console.error("ThreeTree push: something bad happened ??");
            return;
        }
    }
    ////////////////////////////////////////////////////////////////
    //                     updateCameras                          //
    // Function:                                                  //
    //     Resizes all cameras so they fit in their proper places //
    // Return value:                                              //
    //     none                                                   //
    ////////////////////////////////////////////////////////////////
    updateCameras()
    {
        if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log("root height: " + getSubtreeHeight(this.root));
        // root node is always in the topmost leftmost corner
        this._updateCameras(this.root, 
        0, /*x position on screen*/
        0, /*y position on screen*/
        canvas.width  / ((getSubtreeHeight(this.root)) * 2),
        canvas.height / ((getSubtreeHeight(this.root)) * 2)
        );
    }
    ////////////////////////////////////////////////////////////////
    //                     _updateCameras                         //
    // Function:                                                  //
    //     Helper function for _updateCameras                     //
    // Return value:                                              //
    //     none                                                   //
    ////////////////////////////////////////////////////////////////
    _updateCameras(node, screenx, screeny, width, height)
    {
        if (node == null)
        {
            return;
        }
        else 
        {
            if (node == this.root)
            {
                this._updateCameras_subregion(node.first , screenx                     , screeny                      , width, height);
                this._updateCameras_subregion(node.second, (canvas.width - screenx) / 2, screeny                      , width, height);
                this._updateCameras_subregion(node.third , screenx                     , (canvas.height - screeny) / 2, width, height);
                this._updateCameras_subregion(node.fourth, (canvas.width - screenx) / 2, (canvas.height - screeny) / 2, width, height);
            }
            else
            {
                this._updateCameras_subregion(node.first , screenx        , screeny         , width, height);
                this._updateCameras_subregion(node.second, screenx + width, screeny         , width, height);
                this._updateCameras_subregion(node.third , screenx        , screeny + height, width, height);
                this._updateCameras_subregion(node.fourth, screenx + width, screeny + height, width, height);
            }
        }
    }
    _updateCameras_subregion(node, screenx, screeny, width, height)
    {
        if (node == null)
        {
            return;
        }
        node.camera.screenpartitionx = screenx;
        node.camera.screenpartitiony = screeny;
        node.camera.width  = width ;
        node.camera.height = height;
        if (node.subregion == null)
        {
            return;
        }
        else
        {
            this._updateCameras(node.subregion, node.camera.screenpartitionx, node.camera.screenpartitiony, node.camera.width, node.camera.height);
        }
    }
    /////////////////////////////////////////////////////////
    //                immediateLiveChildren                //
    // Function:                                           //
    //     Returns the number of non-null branches at node //
    // Return value:                                       //
    //     integer                                         //
    /////////////////////////////////////////////////////////
    immediateLiveChildren(subregion)
    {
        if (subregion == null)
        {
            return -1;
        }

        var sum = 0;

        if (subregion.first  != null) sum++;
        if (subregion.second != null) sum++;
        if (subregion.third  != null) sum++;
        if (subregion.fourth != null) sum++;

        return sum;
    }
    ////////////////////////////////////////////////////////////////////////////
    //                            iterateTree                                 //
    // Function:                                                              //
    //     Calls helper function _iterateTree and passes lambda function:     //
    //     lambdafunc                                                         //
    // Return value:                                                          //
    //     none                                                               //
    ////////////////////////////////////////////////////////////////////////////
    iterateTree(lambdafunc)
    {
        this._iterateTree(this.root, lambdafunc);
    }
    ////////////////////////////////////////////////////////////////////////
    //                             _iterateTree                           //
    // Function:                                                          //
    //     Helper function for iterateTree                                //
    //     Recursively traverses the tree in-order and applies lambdafunc //
    //     to all nodes                                                   //
    // Return value:                                                      //
    //     none                                                           //
    ////////////////////////////////////////////////////////////////////////
    _iterateTree(subregion, lambdafunc)
    {
        if (subregion == null)
        {
            return;
        }
        else
        {            
            this._iterateTree_subregion(subregion.first , lambdafunc);
            this._iterateTree_subregion(subregion.second, lambdafunc); 
            this._iterateTree_subregion(subregion.third , lambdafunc);
            this._iterateTree_subregion(subregion.fourth, lambdafunc);
            return;
        }
    }
    _iterateTree_subregion(node, lambdafunc)
    {
        if (node == null)
        {
            return;
        }
        if (node.subregion == null)
        {
            lambdafunc(node);
            return;
        }
        else
        {
            lambdafunc(node);
            this._iterateTree(node.subregion, lambdafunc);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////
    //                                 manualPrint                                    //
    // Function:                                                                      //
    //     Calls helper function _manualPrint to print all nodes in the tree in order //
    // Return value:                                                                  //
    //     none                                                                       //
    ////////////////////////////////////////////////////////////////////////////////////

    /*****************        DONT USE ********************/
    /*****************        DONT USE ********************/
    /*****************        DONT USE ********************/
    /*****************        DONT USE ********************/
    manualPrint()
    {
        this._manualPrint(this.root);
    }
    ////////////////////////////////////////////////////////////////////////////////////
    //                                 _manualPrint                                   //
    // Function:                                                                      //
    //     Helper function for manualPrint                                            //
    //     Recursively prints each node's camera.x value in order                     //
    //     Used to test for correct output from iterateTree                           //
    // Return value:                                                                  //
    //     none                                                                       //
    ////////////////////////////////////////////////////////////////////////////////////
    _manualPrint(node)
    {
        if (node == null)
        {
            return;
        }
        else
        {
            console.log("camera x: " + node.camera.x);

            this._iterateTree(node.first );
            this._iterateTree(node.second);
            this._iterateTree(node.third );
            this._iterateTree(node.fourth);
        }
    }
    //////////////////////////////////////////////
    //                printDebug                //
    // Function:                                //
    //     Prints all elements of tree in order //
    //     Used for debugging                   //
    // Return value:                            //
    //     none                                 //
    //////////////////////////////////////////////
    printDebug()
    {
        console.log("Tree contents");
        this.iterateTree(function(node)
        {
            console.log(node);
        });
    }
}
////////////////////////////////////////////////////////////
//                     getSubtreeHeight                   //
// Function:                                              //
//     Recursively gets the height of the subtree at node //
//     Returns the maximum among the three branches       //
//     Root node has a height of 1 if it's the only node  //
// Return value:                                          //
//     integer                                            //
////////////////////////////////////////////////////////////
function getSubtreeHeight(subregion)
{
    if (subregion == null)
    {
        return 0;
    }
    return  Math.max(1 + _getSubtreeHeight(subregion.first),
              Math.max(1 + _getSubtreeHeight(subregion.second), 
                Math.max(1 + _getSubtreeHeight(subregion.third), 
                           1 + _getSubtreeHeight(subregion.fourth))));
}
function _getSubtreeHeight(node)
{
    if (node == null)
    {
        return 0;
    }
    if (node.subregion == null)
    {
        return 0;
    }
    else
    {
        return getSubtreeHeight(node.subregion);
    }
}
/////////////////////////////////////////////////////////////////////
//                        getSubtreeWeight                         //
// Function:                                                       //
//     Recursively traverses down the tree to get the total weight //
//     of a node's subtree                                         //
// Return value:                                                   //
//     integer                                                     //
/////////////////////////////////////////////////////////////////////
function getSubtreeWeight(subregion)
{
    if (subregion == null)
    {
        return 0;
    }
    else
    {
        if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log("weight: " + subregion.weight);
        return subregion.weight 
         + _getSubtreeWeight(subregion.first ) 
         + _getSubtreeWeight(subregion.second) 
         + _getSubtreeWeight(subregion.third )
         + _getSubtreeWeight(subregion.fourth);
    }
}
function _getSubtreeWeight(node)
{
    if (node == null)
    {
        return 0;
    }
    if (node.subregion == null)
    {
        return 0;
    }
    else
    {
        return getSubtreeWeight(node.subregion);
    }
}
////////////////////////////////////////////////////////////////
//                      minimumWeightNode                     //
// Function:                                                  //
//     Compares the weights of each branch at node            //
//     Returns the name in the form of a string of the branch //
//     with the least weight                                  //
// Return value:                                              //
//     string                                                 //
////////////////////////////////////////////////////////////////
function minimumWeightNode(regionnode)
{
    if (regionnode == null)
    {
        return 0;
    }
    
    var n1 = _getSubtreeWeight(regionnode.first );
    var n2 = _getSubtreeWeight(regionnode.second);
    var n3 = _getSubtreeWeight(regionnode.third );
    var n4 = _getSubtreeWeight(regionnode.fourth);
    //                                                                                              FOURTREE
    if (TREE_DEBUG_MSGS && DEBUG_MSGS) console.log("minimum weights: " + n1 + " " + n2 + " " + n3 + " " + n4);
    // I want a deterministic way to get a maximum because I want to fill the tree:
    // "first" 1st, "second" after first, "third" after second etc...
    if      (n1 <= n2 && n1 <= n3 && n1 <= n4) {return 'first' ;}
    else if (n2 <= n1 && n2 <= n3 && n2 <= n4) {return 'second';}
    else if (n3 <= n1 && n3 <= n2 && n3 <= n4) {return 'third' ;}
    else if (n4 <= n1 && n4 <= n2 && n4 <= n3) {return 'fourth';} // FOURTREE
    else
    {
        console.error("minimumWeightNode: bad number or something??");
        return null;
    }
}