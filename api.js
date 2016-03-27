/*jslint todo: true, browser: true, continue: true, white: true*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

var api = {};

/********************************* Math part **********************************/
/**
 * This part defines functions for math functionalities.
 */

api.math = {};

/**
 * Creates a point.
 * @param {number} Optional. The x position.
 * @param {number} Optional. The y position.
 * @param {number} Optional. The z position.
 * @return {object} A point.
 */
api.math.createPoint = function(x, y, z) {
    return {
        x : (x === undefined) ? 0 : x,
        y : (y === undefined) ? 0 : y,
        z : (z === undefined) ? 0 : z
    };
};

//TODO: remove that?
/**
 * Creates a vector. This is equivalent to createPoint.
 * @param {number} Optional. The x position.
 * @param {number} Optional. The y position.
 * @param {number} Optional. The z position.
 * @return {object} A point.
 */
api.math.createVector = function (x, y, z) {
    return api.math.createPoint(x, y, z);
};

api.math.vectorLength2 = function(vector) {
    return vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
};

api.math.vectorLength = function(vector) {
    return Math.sqrt(api.math.vectorLength2(vector));
};

api.math.vectorNormal = function(vector) {
    var length = api.math.vectorLength(vector);
    if(length === 0) {
        return vector;
    }

    return api.math.createVector(vector.x / length, vector.y / length, vector.z / length);
};

/******************************** G-Code part *********************************/
/**
 * This part defines functions for generating GCode.
 * When a function has a problem, returns false else the GCode.
 */

//TODO: functions for cutting through material and letting taps
//TODO: verify that for pocketting, it starts from the center to the border
//      (else dangerous if cutting completely trough material because no tab)

//We consider a three axis tool with Z as the height and depth
//The coordinates are absolute
// End code:        code += "M5\nM2\nM30";

api.gcode = {};

//TODO: find a better name than "cutProperties"
/**
 * Creates the cut properties.
 * @param {number} Bit length in inches.
 * @param {number} Bit width in inches.
 * @param {number} The stepover ratio.
 * @param {number} The feed rate in inches per minutes.
 * @return {object} The cut properties.
 */
api.gcode.createCutProperties = function(bitLength, bitWidth, stepover, feedrate) {
    return {
        bitLength : (bitLength === undefined) ? 0 : bitLength,
        bitWidth : (bitWidth === undefined) ? 0 : bitWidth,
        stepover : (stepover === undefined) ? 0 : stepover,
        feedrate : (feedrate === undefined) ? 0 : feedrate
    };
};

api.gcode.createTabProperties = function(width, height) {
    return {
        width : (width === undefined) ? 0 : width,
        height : (height === undefined) ? 0 : height
    };
};

//TODO: change function name
api.gcode.pointsAccordingToTabs = function(startPoint, endPoint, tabProperties) {
    //We are not using the Z value:
    var startPoint2D = api.math.createPoint(startPoint.x, startPoint.y, 0);
    var endPoint2D = api.math.createPoint(endPoint.x, endPoint.y, 0);
    var points = [startPoint2D, endPoint2D];

    //No need of tabs
    if(tabProperties.height === 0 || tabProperties.width === 0) {
        return points;
    }

    //Tabs bigger than the actual cut path
    var vector = api.math.createVector(endPoint2D.x - startPoint2D.x,
            endPoint2D.y - startPoint2D.y, 0);
    var length2 = api.math.vectorLength2(vector);
    if(length2 <= (tabProperties.width * tabProperties.width)) {
        return points;
    }

    //Create the intermediate points
    var normal = api.math.vectorNormal(vector);
    var distanceStartTab = (api.math.vectorLength(vector) - tabProperties.width) / 2;
    var pointA = api.math.createPoint(startPoint2D.x, startPoint2D.y, 0);
    pointA.x += normal.x * distanceStartTab;
    pointA.y += normal.y * distanceStartTab;
    var pointB = api.math.createPoint(pointA.x, pointA.y, 0);
    pointB.x += normal.x * tabProperties.width;
    pointB.y += normal.y * tabProperties.width;

    points.splice(1, 0, pointA, pointB);
    return points;
};

/**
 * Generates G-Code for cutting the path.
 * @param {array} The path points.
 * @param {number} The depth in inches.
 * @param {object} The cut properties.
 * @param {number} (Optional) The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
api.gcode.cutPath = function(path, depth, cutProperties, safeZ) {
    //TODO: check parameters
    var finalZ = -depth;
    var currentZ = 0;
    var code = [];
    var i = 0;
    var goPoints = [];
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);

    for(i=0; i < path.length; i++) {
        goPoints.push("G1 X" + path[i].x.toFixed(5) +
                " Y" + path[i].y.toFixed(5) + feedrateString);
    }

    code.push(goPoints[0]);
    while(currentZ > finalZ) {
        currentZ = Math.max(currentZ - cutProperties.bitLength, finalZ);
        code.push("G1 Z" + currentZ.toFixed(5) + feedrateString);
        for(i=0; i < goPoints.length; i++) {
            code.push(goPoints[i]);
        }
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

//TODO: make clear that the path is considered 2D on XY plane
api.gcode.cutPolygonWithTabs = function(path, depth, cutProperties, tabProperties, safeZ) {
    //TODO: change all
    //TODO: check parameters
    var finalZ = -depth;
    var currentZ = 0;
    var tabZ = tabProperties.height - depth;
    var code = [];
    var i = 0, j = 0;
    var goPoints = [];
    var previousPoint;
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
    var useTabs = (tabProperties.height !== 0);

    var goNormalPoints = [];
    var goTabPaths = [];
    var tabsPath = [];
    var tabCodeSimplePath = [];

    //Creating the GCode for the 2D path
    for(i=0; i < path.length; i++) {
        goNormalPoints.push("G1 X" + path[i].x.toFixed(5) +
                " Y" + path[i].y.toFixed(5) + feedrateString);

        if(useTabs === true) {
            if(previousPoint !== undefined) {
                tabsPath = api.gcode.pointsAccordingToTabs(previousPoint,
                        path[i], tabProperties);
                tabCodeSimplePath = [];
                for(j=0; j < tabsPath.length; j++) {
                    tabCodeSimplePath.push("G1 X" + tabsPath[j].x.toFixed(5) +
                            " Y" + tabsPath[j].y.toFixed(5) + feedrateString);
                }
                goTabPaths.push(tabCodeSimplePath);
            }

            previousPoint = path[i];
        }
    }

    //Closing the loop
    goNormalPoints.push("G1 X" + path[0].x.toFixed(5) +
            " Y" + path[0].y.toFixed(5) + feedrateString);
    if(useTabs === true && previousPoint !== undefined) {
        tabsPath = api.gcode.pointsAccordingToTabs(previousPoint,
                path[i], tabProperties);
        tabCodeSimplePath = [];
        for(j=0; j < tabsPath.length; j++) {
            tabCodeSimplePath.push("G1 X" + tabsPath[j].x.toFixed(5) +
                    " Y" + tabsPath[j].y.toFixed(5) + feedrateString);
        }
        goTabPaths.push(tabCodeSimplePath);
    }


    code.push(goNormalPoints[0]);
    while(currentZ > finalZ) {
        currentZ = Math.max(currentZ - cutProperties.bitLength, finalZ);
        code.push("G1 Z" + currentZ.toFixed(5) + feedrateString);

        if(useTabs === true && currentZ < tabZ) {
            if(goTabPaths.length > 0 && goTabPaths[0].length > 0) {
                code.push(goTabPaths[i][0]);
            }
            // Not pushing first one to avoid duplicate G-Code
            for(i=0; i < goTabPaths.length-1; i++) {
                // Here a path length is equal to 2 (no tabs) or 4 (with tabs)
                if(goTabPaths[i].length === 4) {
                    code.push(goTabPaths[i][1]);
                    code.push("G1 Z" + tabZ.toFixed(5) + feedrateString);
                    code.push(goTabPaths[i][2]);
                    code.push("G1 Z" + currentZ.toFixed(5) + feedrateString);
                }
                code.push(goTabPaths[i][goTabPaths[i].length - 1]);
            }
        } else {
            for(i=0; i < goPoints.length; i++) {
                code.push(goPoints[i]);
            }
        }
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

api.gcode.cutPolygon = function(path, depth, cutProperties, safeZ) {
    var tab = api.gcode.createTabProperties(0, 0);
    api.gcode.cutPolygonWithTabs(path, depth, cutProperties, tab, safeZ);
};

/**
 * Generates G-Code for pocketting the polygon. The order of the polygon tips
 * is important. The bit will go to a point to the next one and close the
 * polygon by going from the last point to the first point.
 * @param {array} The polygons tip points.
 * @param {number} The depth in inches.
 * @param {object} The cut properties.
 * @param {number} The stepover in inches.
 * @param {number} (Optional) The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
api.gcode.pocketPolygon = function(path, depth, cutProperties, safeZ) {
    //TODO: test arguments

    //Find barycenter
    var depthCut = 0;  //Positive number
    var code = [];
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);

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
    numberIteration = biggestLength / (cutProperties.bitWidth * cutProperties.stepover); //XXX: not sure this is the way
    for(i = 0; i < vectorPath.length; i++) {
        x = vectorPath[i].x;
        y = vectorPath[i].y;
        deltaPath.push({ x : x / numberIteration, y : y / numberIteration });
    }

    code.push("G1 X" + path[path.length - 1].x.toFixed(5) + " Y" + path[path.length - 1].y.toFixed(5) + feedrateString);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + cutProperties.bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        while(n < numberIteration)
        {
            for(i=0; i < path.length; i++) {
                x = path[i].x + n * deltaPath[i].x;
                y = path[i].y + n * deltaPath[i].y;
                code.push("G1 X" + x.toFixed(5) + " Y" + y.toFixed(5) + feedrateString);
            }
            n = Math.min(n + 1, numberIteration);
        }
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

api.gcode.cutCircleWithTabs = function(center, radius, depth, cutProperties, tabHeight, safeZ) {
    //TODO
};

/**
 * Generates G-Code for cutting a circle.
 * @param {object} The center of the circle.
 * @param {number} The radius in inches.
 * @param {number} The depth in inches.
 * @param {object} The cut properties.
 * @param {number} (Optional) The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
api.gcode.cutCircle = function(center, radius, depth, cutProperties, safeZ) {
    var depthCut = 0;  //Positive number
    var code = [];
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
    var endPointString = " X" + (center.x + radius).toFixed(5);
    endPointString += " Y" + center.y.toFixed(5);

    //TODO: test arguments

        //TODO: put tabs
    code.push("G1" + endPointString + feedrateString);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + cutProperties.bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        code.push("G2" + endPointString  + " I " + (-radius).toFixed(5) + feedrateString);
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

//Assume coordinate absolute
//Assume the bit is above the board. End with the bit above the board
/**
 * Generates G-Code for pocketting a circle.
 * @param {object} The center of the circle.
 * @param {number} The radius in inches.
 * @param {number} The depth in inches.
 * @param {object} The cut properties.
 * @param {number} The stepover in inches.
 * @param {number} (Optional) The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
function pocketCircle(center, radius, depth, cutProperties, safeZ) {
    //TODO: testing the arguments
    if(cutProperties.bitWidth > radius * 2) {
        return false;
    }

    var depthCut = 0;  //Positive number
    var deltaMove = cutProperties.stepover * cutProperties.bitWidth;
    var newX = 0;
    var deltaRadius = 0;
    var code = [];
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);

    while(depthCut < depth) {
        depthCut = Math.min(depthCut + cutProperties.bitLength, depth);
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

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
}

api.gcode.cutRectangleWithTabs = function(rectangle, depth, cutProperties, tabHeight, safeZ) {
    //TODO
};

//Rectangle defines 4 points in order to make a rectangle (it will just follow
// the order)
/**
 * Generates G-Code for cutting a rectangle.
 * @param {array} The rectangle points. Should be defined by four points.
 * @param {number} The depth in inches.
 * @param {object} The cut properties.
 * @param {number} (Optional) The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
api.gcode.cutRectangle = function(rectangle, depth, cutProperties, safeZ) {
    //TODO: test arguments
    //TODO: put tabs
    // No use cutPath for the sake of path optimization
    var depthCut = 0;  //Positive number
    var code = [];
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
    var goPoint = [];
    var i = 0;
    var r;

    // We do not use moveTo because need to have a Z undefined
    for(i = 0; i < 4; i++) {
        r = rectangle[i];
        goPoint.push("G1 X" + r.x.toFixed(5) + " Y" + r.y.toFixed(5) + feedrateString);
    }

    code.push(goPoint[0]);
    while(depthCut < depth) {
        depthCut = Math.min(depthCut + cutProperties.bitLength, depth);
        code.push("G1 Z" + (-depthCut).toFixed(5) + feedrateString);
        for(i = 0; i < 4; i++) {
            code.push(goPoint[i]);
        }
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

/**
 * Generates G-Code for pocketting a rectangle.
 * @param {array} The rectangle points. Should be defined by four points.
 * @param {number} The depth in inches.
 * @param {object} The cut properties.
 * @param {number} (Optional) The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
api.gcode.pocketRectangle = function(rectangle, depth, cutProperties, safeZ) {
    return api.gcode.pocketPolygon(rectangle, depth, cutProperties, safeZ);
};

/**
 * Generates G-Code for letting a comment in the code.
 * @return {string} The generated G-Code.
 */
api.gcode.comment = function(message) {
    return "(" + message + ")\n";  // Put \n in case people put G-Code afer that
};

/**
 * Generates G-Code for setting the values in the code in inches. Does not
 * change the fast that the values uses by the function in this API are in
 * inches.
 * @return {string} The generated G-Code.
 */
api.gcode.inInches = function() {
    return "G20";
};

/**
 * Generates G-Code for setting the values in the code in millimeters. Does not
 * change the fast that the values uses by the function in this API are in
 * inches.
 * @return {string} The generated G-Code.
 */
api.gcode.inMillimeters = function() {
    return "G21";
};

/**
 * Generates G-Code for turning on the spindle.
 * @return {string} The generated G-Code.
 */
api.gcode.spindleOn = function() {
    return "M4";
};

/**
 * Generates G-Code for turning off the spindle.
 * @return {string} The generated G-Code.
 */
api.gcode.spindleOff = function() {
    return "M8";
};

/**
 * Generates G-Code for moving as fast as possible the bit to the point. Never
 * use this function for cutting through material.
 * @param {object} The point to reach.
 * @return {string} The generated G-Code.
 */
api.gcode.jogTo = function(point) {
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
};

/**
 * Generates G-Code for moving the bit to the point. This is the function to
 * use when cutting through material.
 * @param {object} The point to reach.
 * @param {number} The feed rate in inches per minutes.
 * @return {string} The generated G-Code.
 */
api.gcode.moveTo = function(point, feedrate) {
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
    code += " F" + feedrate.toFixed(5);

    return code;
};
