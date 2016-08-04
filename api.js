/*jslint todo: true, browser: true, continue: true, white: true*/
/*global earcut*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

var api = {};

/********************************* Math part **********************************/
/**
 * This part defines functions for math functionalities.
 */

api.math = {};

api.math.FLOAT_PRECISION = 0.001;

/**
 * Checks if two numbers are nearly equal. This function is used to avoid
 * to have too much precision when checking values between floating-point
 * numbers.
 *
 * @param {number} a - Number A.
 * @param {number} b - Number B.
 * @param {number} [precision=api.math.FLOAT_PRECISION] - The precision of the
 * comparison.
 * @return {boolean} True if the two values are nearly equal.
 */
api.math.nearlyEqual = function(a, b, precision) {
    var p = (precision === undefined) ? api.math.FLOAT_PRECISION : precision;
    return Math.abs(b - a) <= p;
};

/**
 * Creates a vector. Vectors are used to store simple points too.
 *
 * @param {number} [x=0] - The x position.
 * @param {number} [y=0] - The y position.
 * @param {number} [z=0] - The z position.
 * @return {Vector} A vector.
 */
api.math.createVector = function (x, y, z) {
    return {
        x : (x === undefined) ? 0 : x,
        y : (y === undefined) ? 0 : y,
        z : (z === undefined) ? 0 : z
    };
};

/**
 * Clones a vector.
 *
 * @param {Vector} vector - The vector to clone.
 * @return {Vector} A new vector.
 */
api.math.cloneVector = function(vector) {
    return api.math.createVector(vector.x, vector.y, vector.z);
};


/**
 * Creates a vector going from point A to point B.
 * @param {Vector} pointA - Point A.
 * @param {Vector} pointB - Point B.
 * @return {Vector} A new vector going from point A to point B.
 */
api.math.createVectorFromPoints = function(pointA, pointB) {
    return api.math.createVector(
        pointB.x - pointA.x,
        pointB.y - pointA.y,
        pointB.z - pointA.z
    );
};

/**
 * Checks if two vector are equal (i.e at the same position).
 *
 * @param {Vector} vectorA - Vector A.
 * @param {Vector} vectorB - Vector B.
 * @param {number} [precision=api.math.FLOAT_PRECISION] - The precision of the
 * comparison.
 * @return {boolean} True if the two vectors are equal.
 */
api.math.vectorEqual = function(vectorA, vectorB, precision) {
    var p = (precision === undefined) ? api.math.FLOAT_PRECISION : precision;
    return api.math.nearlyEqual(vectorA.x, vectorB.x, p) &&
        api.math.nearlyEqual(vectorA.y, vectorB.y, p) &&
        api.math.nearlyEqual(vectorA.z, vectorB.z, p);
};

/**
 * Returns the squared length of the vector.
 *
 * @param {Vector} vector - The vector.
 * @return {number}  The squared length.
 */
api.math.vectorLengthSquared = function(vector) {
    return vector.x * vector.x + vector.y * vector.y + vector.z * vector.z;
};

/**
 * Returns the length of the vector.
 *
 * @param {Vector} vector - The vector.
 * @return {number}  The length.
 */
api.math.vectorLength = function(vector) {
    return Math.sqrt(api.math.vectorLengthSquared(vector));
};

/**
 * Returns the normalized vector (without changing the vector).
 *
 * @param {Vector} vector - The vector.
 * @return {Vector} The normalized vector.
 */
api.math.vectorNormalizedVector = function(vector) {
    var l = api.math.vectorLength(vector);
    if(l === 0) {
        return vector;
    }

    return api.math.createVector(vector.x / l, vector.y / l, vector.z / l);
};

/**
 * Returns the scalar product of two vectors.
 *
 * @param {Vector} vectorA - Vector A.
 * @param {Vector} vectorB - Vector B.
 * @return {number} The scalar product.
 */
api.math.scalar = function(vectorA, vectorB) {
    return (vectorA.x * vectorB.x +
            vectorA.y * vectorB.y +
            vectorA.z * vectorB.z);
};

/**
 * Returns the cross product of two vectors.
 *
 * @param {Vector} vectorA - Vector A.
 * @param {Vector} vectorB - Vector B.
 * @return {Vector} The cross product.
 */
api.math.cross = function(vectorA, vectorB) {
    var x = vectorA.y * vectorB.z - vectorA.z * vectorB.y;
    var y = vectorA.z * vectorB.x - vectorA.x * vectorB.z;
    var z = vectorA.x * vectorB.y - vectorA.y * vectorB.x;
    return api.math.createVector(x, y, z);
};

/**
 * Returns a new point which is the result of a rotation of the point according
 * to the center, the angle and scale.
 *
 * @param {Vector} point - The original point to transform. Not modified.
 * @param {Vector} center - The center of rotation and scale.
 * @param {number} angle - The angle in degree.
 * @param {number} scale - The scale of the transformation.
 * @return {Vector} The result of the transformation.
 */
api.math.rotation2D = function(point, center, angle, scale) {
    // newPoint = scale * point * exp(i angle) + center
    var angleRad = angle * Math.PI / 180;
    var cosAngle = Math.cos(angleRad);
    var sinAngle = Math.sin(angleRad);
    var vector = api.math.createVector(point.x - center.x, point.y - center.y, 0);
    var newPoint = api.math.createVector(center.x, center.y, 0);
    newPoint.x += scale * (vector.x * cosAngle - vector.y * sinAngle);
    newPoint.y += scale * (vector.x * sinAngle + vector.y * cosAngle);
    return newPoint;
};

/**
 * Returns the barycenter of the polygon defined by an array of points. Points
 * are considered 2D and having a weight of 1.
 *
 * @param {Vector[]) points - The array of points defining the polygon.
 * @return {Vector|boolean} The barycenter of the polygon. Returns false if the
 * array is empty.
 */
api.math.barycenter2D = function(points) {
    var numberPoints = points.length;
    var sumX = 0;
    var sumY = 0;
    var i = 0;

    if(numberPoints === 0) {
        return false;
    }

    for(i = 0; i < numberPoints; i++) {
        sumX += points[i].x;
        sumY += points[i].y;
    }

    return api.math.createVector(sumX / numberPoints, sumY / numberPoints, 0);
};

/**
 * Returns the sign of the angle defined by the vectors center to pointA and
 * center to pointB.
 *
 * @param {Vector} center - The center of the angle.
 * @param {Vector} pointA - Point A.
 * @param {Vector} pointB - Point B.
 * @return {boolean} True if the sign is positive or zero, else false.
 * */
api.math.angleSignPoints = function(center, pointA, pointB) {
    var u = api.math.createVectorFromPoints(center, pointA);
    var v = api.math.createVectorFromPoints(center, pointB);
    var cross = api.math.cross(u, v);
    return (cross.z >= 0);
};

/**
 * Checks if the polygon defined by the array of points is convex. Points
 * are considered 2D.
 *
 * @param {Vector[]) points - The array of points defining the polygon.
 * @return {boolean} True if the polygon is convex.
 */
api.math.isConvexPolygon = function(polygon) {
    var numberPoints = polygon.length;
    if(numberPoints <= 2) {
        return false;
    }
    if(numberPoints === 3) {
        return true;
    }

    var completePolygon = polygon.slice();
    completePolygon.push(completePolygon[0]);

    var referenceAngleSign = api.math.angleSignPoints(
        completePolygon[0],
        completePolygon[numberPoints - 1],
        completePolygon[1]
    );
    var angleSign;
    var i;

    for(i=1; i < numberPoints; i++) {
        angleSign = api.math.angleSignPoints(
            completePolygon[i],
            completePolygon[i - 1],
            completePolygon[i + 1]
        );
        if(angleSign !== referenceAngleSign) {
            return false;
        }
    }

    // //referenceSign = crossProduct(v1, v2).z > 0;
    // //v1 => [length -1] - 0 ; v2 => [1] - 0;
    // var centerTip = completePolygon[0];
    // var tipA = completePolygon[numberPoints - 1];
    // var tipB = completePolygon[1];
    // var u = api.math.createVectorFromPoints(centerTip, tipA);
    // var v = api.math.createVectorFromPoints(centerTip, tipB);
    // var cross = api.math.cross(u, v);
    // var referenceAngle = (cross.z >= 0);
    // var angleSign;
    // var i;
    //
    // for(i=1; i < numberPoints; i++) {
    //     centerTip = completePolygon[i];
    //     tipA = completePolygon[i - 1]; //v1 = [i - 1] - i;
    //     tipB = completePolygon[i + 1]; //v2 = [i + 1] - i;
    //     u = api.math.createVectorFromPoints(centerTip, tipA);
    //     v = api.math.createVectorFromPoints(centerTip, tipB);
    //     cross = api.math.cross(u, v);
    //     // angleSign = crossProduct(v1, v2).z > 0;
    //     angleSign = (cross.z >= 0);
    //     if(angleSign !== referenceAngle) {
    //         return false;
    //     }
    // }

    return true;
};

/******************************** G-Code part *********************************/
/**
 * This part defines functions for generating GCode.
 * When a function has a problem, returns false else the GCode.
 *
 * We consider a three axis tool with Z as the height and depth.
 * The coordinates are absolute
 */

//TODO:  End code:        code += "M5\nM2\nM30";

api.gcode = {};

/**
 * Creates the cut properties.
 *
 * @param {number} [bitWidth=0] - Bit width in inches.
 * @param {number} [bitLength=0] - Bit length in inches.
 * @param {number} [stepover=0] - The stepover ratio.
 * @param {number} [feedrate=0] - The feed rate in inches per minutes.
 * @return {CutProperties} The cut properties.
 */
api.gcode.createCutProperties = function(bitWidth, bitLength, stepover, feedrate) {
    return {
        bitLength : (bitLength === undefined) ? 0 : bitLength,
        bitWidth : (bitWidth === undefined) ? 0 : bitWidth,
        stepover : (stepover === undefined) ? 0 : stepover,
        feedrate : (feedrate === undefined) ? 0 : feedrate
    };
};

/**
 * Creates the tab properties.
 *
 * @param {number} [width=0] - Width in inches.
 * @param {number} [length=0] - Length in inches.
 * @return {TabProperties} The tab properties.
 */
api.gcode.createTabProperties = function(width, height) {
    return {
        width : (width === undefined) ? 0 : width,
        height : (height === undefined) ? 0 : height
    };
};

//TODO: change function name
//TODO: do not make this function static
/**
 * Returns the 2D points path for the cut. If the length is equal to 2, there
 * is notabs to do else the length is 4 and the tabs are defined in the points
 * at index 1 and 2.
 *
 * @param {Vector} startPoint - The starting point (considered 2D).
 * @param {Vector} endPoint - The ending point (considered 2D).
 * @param {TabProperties} The tab properties.
 * @return {Vector[]} The 2D points path for the cut.
 */
api.gcode.pointsAccordingToTabs = function(startPoint, endPoint, tabProperties) {
    //We are not using the Z value:
    var startPoint2D = api.math.createVector(startPoint.x, startPoint.y, 0);
    var endPoint2D = api.math.createVector(endPoint.x, endPoint.y, 0);
    var points = [startPoint2D, endPoint2D];

    //No need of tabs
    if(tabProperties.height === 0 || tabProperties.width === 0) {
        return points;
    }

    //Tabs bigger than the actual cut path
    // var vector = api.math.createVector(endPoint2D.x - startPoint2D.x,
    //         endPoint2D.y - startPoint2D.y, 0);
    var vector = api.math.createVectorFromPoints(startPoint2D, endPoint2D);
    var length2 = api.math.vectorLengthSquared(vector);
    if(length2 <= (tabProperties.width * tabProperties.width)) {
        return points;
    }

    //Create the intermediate points
    var normalized = api.math.vectorNormalizedVector(vector);
    var distanceStartTab = (api.math.vectorLength(vector) - tabProperties.width) / 2;
    // var pointA = api.math.createVector(startPoint2D.x, startPoint2D.y, 0);
    var pointA = api.math.cloneVector(startPoint2D);
    pointA.x += normalized.x * distanceStartTab;
    pointA.y += normalized.y * distanceStartTab;
    // var pointB = api.math.createVector(pointA.x, pointA.y, 0);
    var pointB = api.math.cloneVector(pointA);
    pointB.x += normalized.x * tabProperties.width;
    pointB.y += normalized.y * tabProperties.width;

    points.splice(1, 0, pointA, pointB);
    return points;
};

/**
 * Generates G-Code for moving as fast as possible the bit to the point (G0).
 * Never use this function for cutting through material.
 *
 * @param {Vector} point - The point to reach.
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
 * Generates G-Code for moving the bit to the point (G1). This is the function
 * to use when cutting through material.
 *
 * @param {Vector} point - The point to reach.
 * @param {number} feedrate - The feed rate in inches per minutes.
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

/**
 * Generates G-Code for cutting the path. The bit will simply go from a point
 * to another. This function is used to have better performance than using
 * consecutively the moveTo function.
 *
 * @param {Vector[]} path - The path points.
 * @param {number} feedrate - The feed rate in inches per minutes.
 * @param {number} [safeZ] - The safe Z position to go after the cut.
 * @return {string} The generated G-Code.
 */
api.gcode.cutPath = function(path, feedrate, safeZ) {
    if(path.length === 0) {
        return "";
    }

    var code = [];
    var i = 0;
    var feedrateString = " F" + feedrate.toFixed(5);

    for(i=0; i < path.length; i++) {
        code.push(
            "G1 X" + path[i].x.toFixed(5) +
            " Y" + path[i].y.toFixed(5) +
            " Z" + path[i].z.toFixed(5) +
            feedrateString
        );
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

/**
 * Generates G-Code for cutting the polygon and letting tabs. The order of the
 * polygon tips is important. The bit will go to a point to the next one and
 * close the polygon by going from the last point to the first point. The
 * polygon is considered 2D on the XY plane. Use this function if you cut
 * completely through the material.
 *
 * @param {Vector[]} polygon - The polygon tip points.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {TabProperties} tabProperties - The tabs properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string|boolean} The generated G-Code or false if impossible to
 *                          parse the given polygon.
 */
api.gcode.cutPolygonWithTabs = function(
    polygon, depth, cutProperties, tabProperties, safeZ
) {
    if(polygon.length < 3) {
        return false;
    }

    var completePolygon = polygon.slice();
    completePolygon.push(completePolygon[0]);
    var pathsWithTabs = [];
    var straightWithTabs = [];
    var point;
    var path = [];
    var finalZ = -depth;
    var currentZ = 0;
    var tabZ = tabProperties.height - depth;
    var i = 0;
    var useTabs = (tabProperties.height !== 0);

    if(useTabs === true) {
        for(i=0; i < completePolygon.length - 1; i++) {
            straightWithTabs = api.gcode.pointsAccordingToTabs(
                    completePolygon[i],
                    completePolygon[i+1],
                    tabProperties
            );
            pathsWithTabs.push(straightWithTabs);
        }
    }

    point = completePolygon[0];
    path.push(api.math.createVector(point.x, point.y, 0));

    currentZ = 0;
    finalZ = -depth;
    while(currentZ > finalZ) {
        currentZ = Math.max(currentZ - cutProperties.bitLength, finalZ);

        if(useTabs === true && currentZ < tabZ) {
            if(pathsWithTabs.length > 0 && pathsWithTabs[0].length > 0) {
                point = pathsWithTabs[0][0];
                path.push(api.math.createVector(point.x, point.y, currentZ));
            }
            for(i=0; i < pathsWithTabs.length; i++) {
                // Not pushing first one to avoid duplicate G-Code
                point = pathsWithTabs[i][1];
                path.push(api.math.createVector(point.x, point.y, currentZ));

                // Here a path length is equal to 2 (no tabs) or 4 (with tabs)
                if(pathsWithTabs[i].length === 4) {
                    path.push(api.math.createVector(point.x, point.y, tabZ));

                    point = pathsWithTabs[i][2];
                    path.push(api.math.createVector(point.x, point.y, tabZ));
                    path.push(api.math.createVector(point.x, point.y, currentZ));

                    point = pathsWithTabs[i][3];
                    path.push(api.math.createVector(point.x, point.y, currentZ));
                }
            }
        } else {
            for(i=0; i < completePolygon.length; i++) {
                point = completePolygon[i];
                path.push(api.math.createVector(point.x, point.y, currentZ));
            }
        }
    }

    return api.gcode.cutPath(path, cutProperties.feedrate, safeZ);
};

/**
 * Generates G-Code for cutting the polygon. The order of the polygon tips
 * is important. The bit will go to a point to the next one and close the
 * polygon by going from the last point to the first point. The polygon is
 * considered 2D on the XY plane. Do not use this function if you cut completely
 * through the material: you need tabs for that. Without tabs, the cutting part
 * can be thrown because of the spindle rotation.
 *
 * @param {Vector[]} polygon - The polygon tip points.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string|boolean} The generated G-Code or false if impossible to
 *                          parse the given polygon.
 */
api.gcode.cutPolygon = function(polygon, depth, cutProperties, safeZ) {
    if(polygon.length < 3) {
        return false;
    }

    var t = api.gcode.createTabProperties(0, 0);
    return api.gcode.cutPolygonWithTabs(polygon, depth, cutProperties, t, safeZ);
};

/**
 * Generates G-Code for pocketing the convex polygon. The order of the polygon
 * tips is important. The bit will go to a point to the next one and close the
 * polygon by going from the last point to the first point. The polygon is
 * considered 2D on the XY plane. If the polygon is not convex, the behaviour
 * is undefined.
 *
 * @param {Vector[]} polygon - The polygon tip points.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string|boolean} The generated G-Code or false if impossible to
 *                          parse the given polygon.
 */
api.gcode.pocketConvexPolygon = function(polygon, depth, cutProperties, safeZ) {
    if(polygon.length < 3) {
        return false;
    }

    var completePolygon = polygon.slice();
    completePolygon.push(completePolygon[0]);
    var deltaMove = cutProperties.stepover * cutProperties.bitWidth;
    var center = api.math.barycenter2D(polygon);
    var numberPoints = polygon.length;
    var i = 0;
    var vector;
    var vectors = [];
    var deltaPath = [];
    var numberIteration = 0;
    var path = [];
    var currentZ = 0;
    var finalZ = -depth;
    var n = 0;
    var biggestLength = 0;

    for(i = 0; i < numberPoints; i++) {
        vector = api.math.createVector(
            center.x - polygon[i].x,
            center.y - polygon[i].y,
            0
        );
        biggestLength = Math.max(api.math.vectorLengthSquared(vector), biggestLength);
        vectors.push(vector);
    }
    vectors.push(vectors[0]);  //To follow completePolygon
    numberIteration = biggestLength / deltaMove;

    if(numberIteration === 0) {
        return false;
    }

    for(i = 0; i < numberPoints; i++) {
        deltaPath.push(api.math.createVector(
            vectors[i].x / numberIteration,
            vectors[i].y / numberIteration,
            0
        ));
    }
    deltaPath.push(deltaPath[0]);  //To follow completePolygon

    path.push(api.math.createVector(polygon[0].x, polygon[0].y, 0));
    currentZ = 0;
    finalZ = -depth;
    while(currentZ > finalZ) {
        currentZ = Math.max(currentZ - cutProperties.bitLength, finalZ);

        //Starting by numberIteration to cut inside-out
        n = numberIteration + 1;  // The + 1 to enable the execution when n = 0
        while(n > 0) {
            n = Math.max(n - 1, 0);
            for(i=0; i < numberPoints + 1; i++) {
                path.push(api.math.createVector(
                    completePolygon[i].x + n * deltaPath[i].x,
                    completePolygon[i].y + n * deltaPath[i].y,
                    currentZ
                ));
            }
        }
    }

    return api.gcode.cutPath(path, cutProperties.feedrate, safeZ);
};

/**
 * Generates G-Code for pocketing the polygon. The order of the polygon tips
 * is important. The bit will go to a point to the next one and close the
 * polygon by going from the last point to the first point. The polygon is
 * considered 2D on the XY plane.
 *
 * @param {Vector[]} polygon - The polygon tip points.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string} The generated G-Code.
 */
api.gcode.pocketSimplePolygon = function(polygon, depth, cutProperties, safeZ) {

    function convertVertexToPoint(earcutPolygon, vertexIndex) {
        var xIndex = vertexIndex * 2;  // 2 because 2D
        return api.math.createVector(
            earcutPolygon[xIndex],
            earcutPolygon[xIndex + 1],
            0
        );
    }

    function convertTriangleVertexIndicesToTriangle(earcutPolygon, a, b, c) {
        var triangle = [];
        triangle.push(convertVertexToPoint(earcutPolygon, a));
        triangle.push(convertVertexToPoint(earcutPolygon, b));
        triangle.push(convertVertexToPoint(earcutPolygon, c));
        return triangle;
    }

    function triangulatePolygon(polygon) {
        var triangles = [];

        var earcutPolygon = [];
        var i = 0;
        for(i = 0; i < polygon.length; i++) {
            earcutPolygon.push(polygon[i].x);
            earcutPolygon.push(polygon[i].y);
        }

        var trianglesVertices = earcut(earcutPolygon);

        for(i = 0; i < trianglesVertices.length; i += 3) {
            triangles.push(
                convertTriangleVertexIndicesToTriangle(
                    earcutPolygon,
                    trianglesVertices[i],
                    trianglesVertices[i + 1],
                    trianglesVertices[i + 2]
                )
            );
        }

        return triangles;
    }

    var triangles = triangulatePolygon(polygon);
    var trianglesCode = [];
    var i = 0;

    for(i = 0; i < triangles.length; i++) {
        trianglesCode.push(
            api.gcode.pocketConvexPolygon(triangles[i], depth, cutProperties, safeZ)
        );
    }

    return trianglesCode.join("\n"); // return the codes
};

/**
 * Generates G-Code for cutting the circle and letting tabs. The circle is
 * considered 2D on the XY plane. Use this function if you cut completely
 * through the material.
 *
 * @param {Vector} center - The circle center.
 * @param {number} radius - The radius in inches.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {TabProperties} tabProperties - The tabs properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string|boolean} The generated G-Code or false if impossible to
 *                          parse the given polygon.
 */
api.gcode.cutCircleWithTabs = function(
    center, radius, depth, cutProperties, tabProperties, safeZ
) {
    if(radius === 0) {
        return false;
    }

    var startPoint = api.math.createVector(center.x + radius, center.y, 0);
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
    var useTabs = (tabProperties.height !== 0 && tabProperties.width !== 0);
    var codeTabs = [];
    var code = [];
    var maxTabAngle = 45;  //TODO: put this somewhere else
    var str = "";
    var tabAngle = 0;
    var normalAngle = 0;
    var endPoint;
    var finalZ = -depth;
    var currentZ = 0;
    var tabZ = tabProperties.height - depth;

    var codeWithoutTab = "G3 X" + startPoint.x.toFixed(5);
    codeWithoutTab += " Y" +startPoint.y.toFixed(5);
    codeWithoutTab += " I" + (-radius).toFixed(5) + feedrateString;

    if(useTabs === true) {
        //perimeter = 2*pi*r; ratio = tabWidth / perimeter; tabAngle = 360 * ratio;
        tabAngle = (180 * tabProperties.width) / (Math.PI * radius);
        if(tabAngle >= maxTabAngle) {
            console.log("Tab angle = " + tabAngle);
            useTabs = false;
        } else {
            normalAngle = 180 - tabAngle;

            endPoint = api.math.rotation2D(startPoint, center, normalAngle, 1);
            str = "G3 X" + endPoint.x.toFixed(5) + " Y" + endPoint.y.toFixed(5);
            str += " R" + radius.toFixed(5) + feedrateString;
            codeTabs.push(str);

            endPoint = api.math.rotation2D(endPoint, center, tabAngle, 1);
            str = "G3 X" + endPoint.x.toFixed(5) + " Y" + endPoint.y.toFixed(5);
            str += " R" + radius.toFixed(5) + feedrateString;
            codeTabs.push(str);

            endPoint = api.math.rotation2D(endPoint, center, normalAngle, 1);
            str = "G3 X" + endPoint.x.toFixed(5) + " Y" + endPoint.y.toFixed(5);
            str += " R" + radius.toFixed(5) + feedrateString;
            codeTabs.push(str);

            //To make sure we close the circle, we go to startPoint:
            str = "G3 X" + startPoint.x.toFixed(5) + " Y" + startPoint.y.toFixed(5);
            str += " R" + radius.toFixed(5) + feedrateString;
            codeTabs.push(str);
        }
    }

    str = "G1 X" + startPoint.x.toFixed(5) + " Y" + startPoint.y.toFixed(5);
    str += feedrateString;
    code.push(str);

    finalZ = -depth;
    currentZ = 0;
    while(currentZ > finalZ) {
        currentZ = Math.max(currentZ - cutProperties.bitLength, finalZ);
        code.push("G1 Z" + currentZ.toFixed(5) + feedrateString);

        if(useTabs === true && currentZ < tabZ) {
            code.push(codeTabs[0]);
            code.push("G1 Z" + tabZ.toFixed(5) + feedrateString);
            code.push(codeTabs[1]);
            code.push("G1 Z" + currentZ.toFixed(5) + feedrateString);
            code.push(codeTabs[2]);
            code.push("G1 Z" + tabZ.toFixed(5) + feedrateString);
            code.push(codeTabs[3]);
        } else {
            code.push(codeWithoutTab);
        }
    }

    if(safeZ !== undefined) {
        code.push("G1 Z" + safeZ.toFixed(5) + feedrateString);
    }

    return code.join("\n");
};

/**
 * Generates G-Code for cutting a circle. The circle is
 * considered 2D on the XY plane. Do not use this function if you cut completely
 * through the material: you need tabs for that. Without tabs, the cutting part
 * can be thrown because of the spindle rotation.
 *
 * @param {Vector} center - The circle center.
 * @param {number} radius - The radius in inches.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string|boolean} The generated G-Code or false if impossible to
 *                          parse the given polygon.
 */
api.gcode.cutCircle = function(center, radius, depth, cutProperties, safeZ) {
    var t = api.gcode.createTabProperties(0, 0);
    return api.gcode.cutCircleWithTabs(center, radius, depth, cutProperties, t, safeZ);
};

//Assume coordinate absolute
//Assume the bit is above the board. End with the bit above the board
/**
 * Generates G-Code for pocketing a circle.
 *
 * @param {Vector} center - The circle center.
 * @param {number} radius - The radius in inches.
 * @param {number} depth - The depth in inches.
 * @param {CutProperties} cutProperties - The cut properties.
 * @param {number} [safeZ] - The safe Z position to go after the cut in inches.
 * @return {string|boolean} The generated G-Code or false if impossible to
 *                          parse the given polygon.
 */
function pocketCircle(center, radius, depth, cutProperties, safeZ) {
    if(cutProperties.bitWidth > radius * 2) {
        return false;
    }

    var deltaMove = cutProperties.stepover * cutProperties.bitWidth;
    var newX = 0;
    var deltaRadius = 0;
    var code = [];
    var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
    var currentZ = 0;
    var finalZ = -depth;

    while(currentZ > finalZ) {
        currentZ = Math.max(currentZ - cutProperties.bitLength, finalZ);
        //From inside to outside
        code.push("G1 X" + center.x.toFixed(5) + " Y" + center.y.toFixed(5) + feedrateString);
        code.push("G1 Z" + currentZ.toFixed(5) + feedrateString);
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

/**
 * Generates G-Code for letting a comment in the code (in parenthesis).
 *
 * @param {string} message - The comment.
 * @return {string} The generated G-Code.
 */
api.gcode.comment = function(message) {
    return "(" + message + ")\n";  // Put \n in case people put G-Code afer that
};

/**
 * Generates G-Code for setting the values in the code in inches (G20).  Does
 * not change the fact that the values used by the functions in this API are in
 * inches.
 *
 * @return {string} The generated G-Code.
 */
api.gcode.inInches = function() {
    return "G20";
};

/**
 * Generates G-Code for setting the values in the code in millimeters (G21).
 * Does not change the fact that the values used by the functions in this API
 * are in inches.
 *
 * @return {string} The generated G-Code.
 */
api.gcode.inMillimeters = function() {
    return "G21";
};

/**
 * Generates G-Code for turning on the spindle (M4).
 *
 * @return {string} The generated G-Code.
 */
api.gcode.spindleOn = function() {
    return "M4";
};

/**
 * Generates G-Code for turning off the spindle (M8).
 *
 * @return {string} The generated G-Code.
 */
api.gcode.spindleOff = function() {
    return "M8";
};

/**
 * Generates G-Code for returning to the start of the program (M30).
 *
 * @return {string} The generated G-Code.
 */
api.gcode.rewind = function() {
    return "M30";
};
