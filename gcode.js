/*jslint todo: true, browser: true, continue: true, white: true*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

/**
 * This file defines functions for generating GCode.
 * When a function has a problem, returns false else the GCode.
 */

//TODO: check consistency of arguments
//TODO: functions for cutting through material and letting taps

//We consider a three axis tool with Z as the height and depth
//The coordinates are absolute
// End code:        code += "M5\nM2\nM30";

function cutPath(path, depth, bitLength, feedrate) {
    //TODO: check parameters
    var depthCut = 0;  //Positive number
    var code = [];
    var i = 0;
    var goPoints = [];
    var feedrateString = " F" + feedrate.toFixed(5);

    for(i=0; i < path.length; i++) {
        goPoints.push("G1 X" + path[i].x.toFixed(5) + " Y" + path[i].y.toFixed(5) + feedrateString);
    }

    code.push(goPoints[goPoints.length - 1]);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        //TODO: got path to path
        for(i=0; i < goPoints.length; i++) {
            code.push(goPoints[i]);
        }
    }

    code.push("G1 Z3" + feedrateString);
    return code.join("\n");
}

function pocketPolygon(path, depth, stepover, bitWidth, bitLength, feedrate) {
    //TODO: test arguments

    //Find barycenter
    var depthCut = 0;  //Positive number
    var code = [];
    var feedrateString = " F" + feedrate.toFixed(5);

    var center = { x : 0, y : 0 };
    var sumX = 0, sumY = 0;
    var i = 0, n = 0;
    var x = 0, y = 0, biggestLength = 0;
    var vectorPath = [], deltaPath = []; //deltaPath = how much move for each points

    var numberIteration = 0;

    for(i = 0; i < path.length; i++) {
        sumX += path[i].x;
        sumY += path[i].y;
    }
    center.x = sumX / path.length;
    center.y = sumY / path.length;

    //Set vectors from points to center
    for(i = 0; i < path.length; i++) {
        x = center.x - path[i].x;
        y = center.y - path[i].y;
        biggestLength = Math.max(Math.sqrt(x * x + y * y), biggestLength);
        vectorPath.push({ x : x, y : y });
    }
    numberIteration = biggestLength / (bitWidth * stepover); //XXX: not sure this is the way

    for(i = 0; i < vectorPath.length; i++) {
        deltaPath.push({ x : x / numberIteration, y : y / numberIteration });
    }

    code.push("G1 " + path[path.length - 1].x.toFixed(5) + " Y" + path[path.length - 1].y.toFixed(5) + feedrateString);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        while(n < numberIteration)
        {
            for(i=0; i < path.length; i++) {
                x = path[i].x + n * deltaPath[i].x;
                y = path[i].y + n * deltaPath[i].y;
                code.push("G1 " + x.toFixed(5) + " Y" + y.toFixed(5) + feedrateString);
            }
            n = Math.max(n + 1, numberIteration);
        }
    }

    code.push("G1 Z3" + feedrateString);
    return code.join("\n");
}

function cutCircle(center, depth, radius, bitLength, feedrate) {
    var depthCut = 0;  //Positive number
    var code = [];
    var feedrateString = " F" + feedrate.toFixed(5);
    var endPointString = " X" + (center.x + radius).toFixed(5);
    endPointString += " Y" + center.y.toFixed(5);

    //TODO: test arguments

    code.push("G1" + endPointString + feedrateString);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        code.push("G2" + endPointString  + " I " + (-radius).toFixed(5) + feedrateString);
    }

    code.push("G1 Z3" + feedrateString);
    return code.join("\n");
}

//Assume coordinate absolute
//Assume the bit is above the board. End with the bit above the board
function pocketCircle(center, depth, radius, stepover, bitLength, bitWidth,
        feedrate) {
    //TODO: testing the arguments
    if(bitWidth < radius * 2) {
        return false;
    }

    var depthCut = 0;  //Positive number
    var deltaMove = stepover * bitWidth;
    var newX = 0;
    var deltaRadius = 0;
    var code = [];
    var feedrateString = " F" + feedrate.toFixed(5);

    while(depthCut < depth) {
        depthCut = Math.min(depthCut + bitLength, depth);
        //From inside to outside
        code.push("G1 X" + center.x.toFixed(5) + " Y" + center.y.toFixed(5) + feedrateString);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        while(deltaRadius < radius) {
            deltaRadius = Math.min(deltaRadius + deltaMove, radius);
            newX = center.x + deltaRadius;
            code.push("G1 X" + newX.toFixed(5) + feedrateString);
            code.push("G2 X" + newX.toFixed(5) + " I " + (-deltaRadius).toFixed(5) + feedrateString);
        }
    }

    code.push("G1 Z3" + feedrateString);
    return code.join("\n");
}

//Rectangle can be rotated
//Rectangle defines 4 points in order to make a rectangle (it will just follow
// the order)
function cutRectangle(rectangle, depth, bitLength, feedrate) {
    //TODO: test arguments
    var depthCut = 0;  //Positive number
    var code = [];
    var feedrateString = " F" + feedrate.toFixed(5);

    var goPoint0 = "G1 X" + rectangle[0].x.toFixed(5) + " Y" + rectangle[0].y.toFixed(5) + feedrateString;
    var goPoint1 = "G1 X" + rectangle[1].x.toFixed(5) + " Y" + rectangle[1].y.toFixed(5) + feedrateString;
    var goPoint2 = "G1 X" + rectangle[2].x.toFixed(5) + " Y" + rectangle[2].y.toFixed(5) + feedrateString;
    var goPoint3 = "G1 X" + rectangle[3].x.toFixed(5) + " Y" + rectangle[3].y.toFixed(5) + feedrateString;

    code.push(goPoint0);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        code.push(goPoint1);
        code.push(goPoint2);
        code.push(goPoint3);
        code.push(goPoint0);
    }

    code.push("G1 Z3" + feedrateString);
    return code.join("\n");
}

function pocketRectangle(rectangle, depth, stepover, bitWidth, bitLength, feedrate) {
    //TODO: test arguments
    return pocketPolygon(rectangle, depth, stepover, bitWidth, bitLength, feedrate);
}

function comment(message) {
    return "(" + message + ")";  //TODO: put \n?
}

function inInches() {
    return "G20";
}

function inMilimeters() {
    return "G21";
}

function spindleOn() {
    return "M4";
}

function spindleOff() {
    return "M8";
}

function jogTo(point) {
    var code = "G0";
    if(point.x !== undefined) {
        code += " X" + point.x.toFixed(5);
    }
    if(point.y !== undefined) {
        code += " Y" + point.y.toFixed(5);
    }
    if(point.z !== undefined) {
        code += " Z" + point.z.toFixed(5);
    }
    return code;
}

function moveTo(point, feedrate) {
    var code = "G1";

    if(feedrate === undefined) {
        return false;
    }

    if(point.x !== undefined) {
        code += " X" + point.x.toFixed(5);
    }
    if(point.y !== undefined) {
        code += " Y" + point.y.toFixed(5);
    }
    if(point.z !== undefined) {
        code += " Z" + point.z.toFixed(5);
    }
    code += " F120" + point.z.toFixed(5);
    return code;
}
