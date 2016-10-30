/*jslint todo: true, browser: true, continue: true, white: true*/
/*global earcut*/

/**
 * Written by Alex Canales for ShopBotTools, Inc.
 */

/**
 * Namespace for the API. All function and class definitions lie in this
 * namespace or its children namespaces.
 *
 * @namespace
 */
var api = {};

/**
 * Constant for converting inches values into millimeters values. Used by
 * convertInchToMillimeter.
 */
api.INCH_TO_MILLIMETER = 25.4;

/**
 * Constant for converting millimeters values into inches values. Used by
 * convertMillimeterToInch.
 */
api.MILLIMETER_TO_INCH = 0.03937008;

/**
 * Converts an unit in inches to an unit in millimeters.
 *
 * @param {number} unit - The unit in inches.
 * @return {number} The unit in millimeters.
 */
api.convertInchToMillimeter = function(unit) {
    return unit * api.INCH_TO_MILLIMETER;
};

/**
 * Converts an unit in millimeters to an unit in inches.
 *
 * @param {number} unit - The unit in millimeters.
 * @return {number} The unit in inches.
 */
api.convertMillimeterToInch = function(unit) {
    return unit * api.MILLIMETER_TO_INCH;
};

/********************************* Math part **********************************/

/**
 * This part defines functions for math functionalities.
 * @namespace
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
    "use strict";
    var p = (precision === undefined) ? api.math.FLOAT_PRECISION : precision;
    return Math.abs(b - a) <= p;
};

/**
 * Creates a vector. Vectors are used to store simple points too.
 *
 * @class
 * @param {number} [x=0] - The x position.
 * @param {number} [y=0] - The y position.
 * @param {number} [z=0] - The z position.
 * @return {Vector} A vector.
 */
api.math.Vector = function(x, y, z) {
    "use strict";
    this.x = (x === undefined) ? 0 : x;
    this.y = (y === undefined) ? 0 : y;
    this.z = (z === undefined) ? 0 : z;
};

api.math.Vector.prototype = {

    /**
     * Clones the vector.
     *
     * @return {Vector} A new vector.
     */
    clone : function() {
        "use strict";
        return new api.math.Vector(this.x, this.y, this.z);
    },

    /**
     * Checks if two vectors are equal (i.e at the same position).
     *
     * @param {Vector} vector - The other vector.
     * @param {number} [precision=api.math.FLOAT_PRECISION] - The precision of
     * the comparison.
     * @return {boolean} True if the two vectors are equal.
     */
    equal: function(vector, precision) {
        "use strict";
        var p = (precision === undefined) ? api.math.FLOAT_PRECISION : precision;
        return (api.math.nearlyEqual(this.x, vector.x, p) &&
            api.math.nearlyEqual(this.y, vector.y, p) &&
            api.math.nearlyEqual(this.z, vector.z, p));

    },

    /**
     * Returns the squared length of the vector.
     *
     * @return {number}  The squared length.
     */
    lengthSquared : function() {
        "use strict";
        return this.x * this.x + this.y * this.y + this.z * this.z;
    },

    /**
     * Returns the length of the vector.
     *
     * @return {number}  The length.
     */
    length : function() {
        "use strict";
        return Math.sqrt(this.lengthSquared());
    },

    /**
     * Returns the normalized vector (without changing the vector).
     *
     * @return {Vector} The normalized vector.
     */
    normalizedVector : function() {
        "use strict";
        var l = this.length();
        if(l === 0) {
            return this.clone();
        }

        return new api.math.Vector(this.x / l, this.y / l, this.z / l);
    }
};

/**
 * Returns the scalar product of two vectors.
 *
 * @param {Vector} vectorA - Vector A.
 * @param {Vector} vectorB - Vector B.
 * @return {number} The scalar product.
 */
api.math.Vector.scalar = function(vectorA, vectorB) {
    "use strict";
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
api.math.Vector.cross = function(vectorA, vectorB) {
    "use strict";
    var x = vectorA.y * vectorB.z - vectorA.z * vectorB.y;
    var y = vectorA.z * vectorB.x - vectorA.x * vectorB.z;
    var z = vectorA.x * vectorB.y - vectorA.y * vectorB.x;
    return new api.math.Vector(x, y, z);
};

/**
 * Creates a vector going from point A to point B.
 * @param {Vector} pointA - Point A.
 * @param {Vector} pointB - Point B.
 * @return {Vector} A new vector going from point A to point B.
 */
api.math.Vector.fromPoints = function(pointA, pointB) {
    "use strict";
    return new api.math.Vector(
        pointB.x - pointA.x,
        pointB.y - pointA.y,
        pointB.z - pointA.z
    );
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
    "use strict";
    // newPoint = scale * point * exp(i angle) + center
    var angleRad = angle * Math.PI / 180;
    var cosAngle = Math.cos(angleRad);
    var sinAngle = Math.sin(angleRad);
    var vector = new api.math.Vector.fromPoints(center, point);
    var newPoint = new api.math.Vector(center.x, center.y, 0);
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
    "use strict";
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

    return new api.math.Vector(sumX / numberPoints, sumY / numberPoints, 0);
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
    "use strict";
    var u = api.math.Vector.fromPoints(center, pointA);
    var v = api.math.Vector.fromPoints(center, pointB);
    var cross = api.math.Vector.cross(u, v);
    return (cross.z >= 0);
};

/**
 * Checks if the polygon defined by the array of points is convex. Points
 * are considered 2D.
 *
 * @param {Vector[]) points - The array of points defining the polygon.
 * @return {boolean} True if the polygon is convex. False if not or the
 * polygon is defined by less than three points.
 */
api.math.isConvexPolygon = function(polygon) {
    "use strict";
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

    return true;
};

/**
 * Checks if the polygon defined by the array of points is clockwise. Points
 * are considered 2D.
 *
 * @param {Vector[]) points - The array of points defining the polygon.
 * @return {boolean} True if the polygon is clockwise. False if not or the
 * polygon is defined by less than three points.
 */
api.math.isClockwisePolygon = function(polygon) {
    "use strict";
    if(polygon.length < 3) {
        return false;
    }

    var sum = 0;
    var i = 0;

    if(polygon.length < 3) {
        return polygon;
    }

    // Using Shoelace formula
    for(i = 0; i < polygon.length-1; i++) {
        sum += (polygon[i].x * polygon[i+1].y) -
            (polygon[i].y * polygon[i+1].x);
    }
    sum += (polygon[polygon.length-1].x * polygon[0].y) -
        (polygon[polygon.length-1].y * polygon[0].x);

    return (sum >= 0);
}

/******************************* Cut properties *******************************/

/**
 * Creates the cut properties.
 *
 * @class
 * @param {number} [bitDiameter=0] - Bit width in inches.
 * @param {number} [passDepth=0] - Bit length in inches.
 * @param {number} [stepover=0] - The stepover ratio.
 * @param {number} [feedrate=0] - The feed rate in inches per minutes.
 * @return {CutProperties} The cut properties.
 */
api.CutProperties = function(bitDiameter, passDepth, stepover, feedrate) {
    "use strict";
    this.bitDiameter = (bitDiameter === undefined) ? 0 : bitDiameter;
    this.passDepth = (passDepth === undefined) ? 0 : passDepth;
    this.stepover = (stepover === undefined) ? 0 : stepover;
    this.feedrate = (feedrate === undefined) ? 0 : feedrate;
};

api.CutProperties.prototype = {
    /**
     * Returns the offset distance between two passes.
     *
     * @return {number} The offset distance.
     */
    offsetDistance : function() {
        return this.bitDiameter * this.stepover;
    }
};

/******************************* Tab properties *******************************/

/**
 * Creates the tab properties. It is considered as not used if the width or the
 * height is equal or below to zero.
 *
 * @class
 * @param {number} [width=0] - Width in inches.
 * @param {number} [length=0] - Length in inches.
 * @return {TabProperties} The tab properties.
 */
api.TabProperties = function(width, height) {
    "use strict";
    this.width = (width === undefined) ? 0 : width;
    this.height = (height === undefined) ? 0 : height;
};

api.TabProperties.prototype = {
    /**
     * The maximum angle a tab can have when cutting a circle.
     */
    MAX_ANGLE : 45,

    /**
     * If the tab are correct and can be used.
     *
     * @return {boolean} True if the tab can be used.
     */
    isUsed : function() {
        "use strict";
        return (this.width > 0 && this.height > 0);
    }
};

/******************************** G-Code part *********************************/

/**
 * This part defines functions for generating GCode.
 * When a function has a problem, returns false else the GCode.
 *
 * We consider a three axis tool with Z as the height and depth.
 * The coordinates are absolute.
 * @namespace
 */
api.gcode = (function() {

    /**
     * Returns the 2D points path for the cut. If the length is equal to 2, there
     * is notabs to do else the length is 4 and the tabs are defined in the points
     * at index 1 and 2.
     *
     * @param {Vector} start - The starting point (considered 2D).
     * @param {Vector} end - The ending point (considered 2D).
     * @param {TabProperties} The tab properties.
     * @return {Vector[]} The 2D points path for the cut.
     */
    function pointsAccordingToTabs(start, end, tabProperties) {
        "use strict";
        //We are not using the Z value:
        var start2D = new api.math.Vector(start.x, start.y, 0);
        var end2D = new api.math.Vector(end.x, end.y, 0);
        var points = [start2D, end2D];

        if(tabProperties.isUsed() === false) {
            return points;
        }

        //Tabs bigger than the actual cut path
        var vector = api.math.Vector.fromPoints(start2D, end2D);
        if(vector.lengthSquared() <= (tabProperties.width * tabProperties.width)) {
            return points;
        }

        //Create the intermediate points
        var normalized = vector.normalizedVector();
        var distanceStartTab = (vector.length() - tabProperties.width) / 2;
        var pointA = start2D.clone();
        pointA.x += normalized.x * distanceStartTab;
        pointA.y += normalized.y * distanceStartTab;
        var pointB = pointA.clone();
        pointB.x += normalized.x * tabProperties.width;
        pointB.y += normalized.y * tabProperties.width;

        points.splice(1, 0, pointA, pointB);
        return points;
    }

    return {

        /**
         * Generates G-Code for moving as fast as possible the bit to the point
         * (G0).  Never use this function for cutting through material.
         *
         * @memberof api.gcode
         * @param {Vector} point - The point to reach.
         * @return {string} The generated G-Code.
         */
        jogTo : function(point) {
            "use strict";
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
            return code + '\n';
        },

        /**
         * Generates G-Code for moving the bit to the point (G1). This is the
         * function to use when cutting through material.
         *
         * @memberof api.gcode
         * @param {Vector} point - The point to reach.
         * @param {number} feedrate - The feed rate in inches per minutes.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        moveTo : function(point, feedrate) {
            "use strict";
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

            return code + '\n';
        },

        /**
         * Generates G-Code for letting a comment in the code (in parenthesis).
         *
         * @memberof api.gcode
         * @param {string} message - The comment.
         * @return {string} The generated G-Code.
         */
        comment : function(message) {
            "use strict";
            return "(" + message + ")\n";
        },

        /**
         * Sets the plane in which the G2/G3 arcs are drawn on XY (G17). Does
         * not change the fact that functions for cutting and pocketting the
         * circles use XY plane. You should not use this function and built-in
         * functions for circle operation at the same time.
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        selectXYPlane : function() {
            return "G17\n";
        },

        /**
         * Sets the plane in which the G2/G3 arcs are drawn on XZ (G18). Does
         * not change the fact that functions for cutting and pocketting the
         * circles use XY plane. You should not use this function and built-in
         * functions for circle operation at the same time.
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        selectXZPlane : function() {
            return "G18\n";
        },

        /**
         * Sets the plane in which the G2/G3 arcs are drawn on YZ (G19). Does
         * not change the fact that functions for cutting and pocketting the
         * circles use XY plane. You should not use this function and built-in
         * functions for circle operation at the same time.
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        selectYZPlane : function() {
            return "G19\n";
        },

        /**
         * Generates G-Code for setting the values in the code in inches (G20).
         * Does not change the fact that the values used by the functions in
         * this API are in inches.
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        inInches : function() {
            return "G20\n";
        },

        /**
         * Generates G-Code for setting the values in the code in millimeters
         * (G21).  Does not change the fact that the values used by the
         * functions in this API are in inches.
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        inMillimeters : function() {
            return "G21\n";
        },

        /**
         * Generates G-Code for ending the program (M2).
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        end : function() {
            return "M2\n";
        },

        /**
         * Generates G-Code for turning on the spindle (M4).
         *
         * @memberof api.gcode
         * @param {number} [speed] - The speed
         * @return {string} The generated G-Code.
         */
        spindleOn : function(speed) {
            if(speed !== undefined) {
                return "M4 S" + speed + '\n';
            }
            return "M4\n";
        },

        /**
         * Generates G-Code for turning off the spindle (M5).
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        spindleOff : function() {
            return "M5\n";
        },

        /**
         * Generates G-Code for ending the program and returning to its start
         * (M30).
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        rewind : function() {
            return "M30\n";
        },

        /**
         * Generates G-Code for stopping the program (M60).
         *
         * @memberof api.gcode
         * @return {string} The generated G-Code.
         */
        stop : function() {
            return "M60\n";
        },

        /**
         * Generates G-Code for cutting the path. The bit will simply go from a
         * point to another. This function is used to have better performance
         * than using consecutively the moveTo function.
         *
         * @memberof api.gcode
         * @param {Vector[]} path - The path points.
         * @param {number} feedrate - The feed rate in inches per minutes.
         * @param {number} [safeZ] - The safe Z position to go after the cut.
         * @return {string} The generated G-Code.
         */
        cutPath : function(path, feedrate, safeZ) {
            "use strict";
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

            return code.join('\n') + '\n';
        },

        /**
         * Generates G-Code for cutting the path and letting tabs for each
         * straight lines (if possible). The path is considered 2D on the XY
         * plane.
         *
         * @memberof api.gcode
         * @param {Vector[]} path2D - The path.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {TabProperties} tabProperties - The tabs properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given path.
         */
        cutPath2DWithTabs : function(
            path2D, depth, cutProperties, tabProperties, safeZ
        ) {
            "use strict";
            if(path2D.length < 2) {
                return false;
            }

            function getPaths2DWithTabs(path, tabProperties) {
                var i = 0;
                var straightWithTabs = [];
                var pathsWithTabs = [];
                for(i=0; i < path.length - 1; i++) {
                    straightWithTabs = pointsAccordingToTabs(
                        path[i],
                        path[i+1],
                        tabProperties
                    );
                    pathsWithTabs.push(straightWithTabs);
                }
                return pathsWithTabs;
            }

            var Paths2DWithTabsController = function(paths2DWithTabs) {
                this.hasToReverse = true;
                this.normal = paths2DWithTabs;
                this.reversed = [];
                this.setReversedPath();
            };

            Paths2DWithTabsController.prototype = {
                setReversedPath : function() {
                    var i = 0, j = 0;
                    var straight = [];
                    this.resersed  = [];
                    for(i = this.normal.length-1; i >= 0; i--) {
                        straight = [];
                        for(j = this.normal[i].length - 1; j >= 0; j--) {
                            straight.push(this.normal[i][j].clone());
                        }
                        this.reversed.push(straight);
                    }
                },

                // The first time is called, it throws the normal path
                // Returns path to use and swipe for the next time it is asked
                getCurrentPaths : function() {
                    this.hasToReverse = (this.hasToReverse === false);
                    if(this.hasToReverse === true) {
                        return this.reversed;
                    }
                    return this.normal;
                }
            };

            function getPath3DFromStraightPath2D(straight, currentZ, tabZ, useTabs) {
                var point;
                var path3D = [];
                if(useTabs === true && straight.length === 4 && currentZ < tabZ) {
                    point = straight[0];
                    path3D.push((new api.math.Vector(point.x, point.y, currentZ)));

                    point = straight[1];
                    path3D.push(new api.math.Vector(point.x, point.y, currentZ));
                    path3D.push(new api.math.Vector(point.x, point.y, tabZ));

                    point = straight[2];
                    path3D.push(new api.math.Vector(point.x, point.y, tabZ));
                    path3D.push(new api.math.Vector(point.x, point.y, currentZ));

                    point = straight[3];
                    path3D.push(new api.math.Vector(point.x, point.y, currentZ));
                } else {
                    point = straight[0];
                    path3D.push(new api.math.Vector(point.x, point.y, currentZ));
                    point = straight[straight.length - 1];
                    path3D.push(new api.math.Vector(point.x, point.y, currentZ));
                }
                return path3D;
            }

            var path3D = [];
            var currentPaths2D = [];
            var finalZ = -depth;
            var currentZ = 0;
            var tabZ = tabProperties.height - depth;
            var controller = new Paths2DWithTabsController(
                getPaths2DWithTabs(path2D, tabProperties)
            );
            var point = controller.normal[0][0];
            var i = 0;

            path3D.push(new api.math.Vector(point.x, point.y, safeZ));
            while(currentZ > finalZ) {
                currentZ = Math.max(currentZ - cutProperties.passDepth, finalZ);
                currentPaths2D = controller.getCurrentPaths();

                for(i=0; i < currentPaths2D.length; i++) {
                    path3D = path3D.concat(
                        getPath3DFromStraightPath2D(
                            currentPaths2D[i], currentZ, tabZ, tabProperties.isUsed()
                        )
                    );
                }
            }

            return this.cutPath(path3D, cutProperties.feedrate, safeZ);
        },

        /**
         * Generates G-Code for cutting the patth. The path is considered 2D on
         * the XY plane. It is assumed that the bit is above the board.
         *
         * @memberof api.gcode
         * @param {Vector[]} path2D - The path with absolute coordinates in
         * inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given path.
         */
        cutPath2D : function(path, depth, cutProperties, safeZ) {
            "use strict";
            if(path.length < 2) {
                return false;
            }

            var t = new api.TabProperties();
            return this.cutPath2DWithTabs(path, depth, cutProperties, t, safeZ);
        },

        /**
         * Generates G-Code for cutting the polygon and letting tabs. The order
         * of the polygon tips is important. The bit will go to a point to the
         * next one and close the polygon by going from the last point to the
         * first point. The polygon is considered 2D on the XY plane. Use this
         * function if you cut completely through the material. It is assumed
         * that the bit is above the board.
         *
         * @memberof api.gcode
         * @param {Vector[]} polygon - The polygon tip points with absolute
         * coordinates in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {TabProperties} tabProperties - The tabs properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        cutPolygonWithTabs : function(
            polygon, depth, cutProperties, tabProperties, safeZ
        ) {
            "use strict";
            if(polygon.length < 3) {
                return false;
            }

            // Cannot use cutPath2DWithTabs, it has a different behaviour

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

            if(tabProperties.isUsed() === true) {
                for(i=0; i < completePolygon.length - 1; i++) {
                    straightWithTabs = pointsAccordingToTabs(
                        completePolygon[i],
                        completePolygon[i+1],
                        tabProperties
                    );
                    pathsWithTabs.push(straightWithTabs);
                }
            }

            point = completePolygon[0];
            path.push(new api.math.Vector(point.x, point.y, safeZ));

            currentZ = 0;
            finalZ = -depth;
            while(currentZ > finalZ) {
                currentZ = Math.max(currentZ - cutProperties.passDepth, finalZ);

                if(tabProperties.isUsed() === true && currentZ < tabZ) {
                    if(pathsWithTabs.length > 0 && pathsWithTabs[0].length > 0) {
                        point = pathsWithTabs[0][0];
                        path.push(new api.math.Vector(point.x, point.y, currentZ));
                    }
                    for(i=0; i < pathsWithTabs.length; i++) {
                        // Not pushing first one to avoid duplicate G-Code
                        point = pathsWithTabs[i][1];
                        path.push(new api.math.Vector(point.x, point.y, currentZ));

                        // Here a path length is equal to 2 (no tabs) or 4 (with tabs)
                        if(pathsWithTabs[i].length === 4) {
                            path.push(new api.math.Vector(point.x, point.y, tabZ));

                            point = pathsWithTabs[i][2];
                            path.push(new api.math.Vector(point.x, point.y, tabZ));
                            path.push(new api.math.Vector(point.x, point.y, currentZ));

                            point = pathsWithTabs[i][3];
                            path.push(new api.math.Vector(point.x, point.y, currentZ));
                        }
                    }
                } else {
                    for(i=0; i < completePolygon.length; i++) {
                        point = completePolygon[i];
                        path.push(new api.math.Vector(point.x, point.y, currentZ));
                    }
                }
            }

            return this.cutPath(path, cutProperties.feedrate, safeZ);
        },

        /**
         * Generates G-Code for cutting the polygon. The order of the polygon
         * tips is important. The bit will go to a point to the next one and
         * close the polygon by going from the last point to the first point.
         * The polygon is considered 2D on the XY plane. Do not use this
         * function if you cut completely through the material: you need tabs
         * for that. Without tabs, the cutting part can be thrown because of
         * the spindle rotation. It is assumed that the bit is above the board.
         *
         * @memberof api.gcode
         * @param {Vector[]} polygon - The polygon tip points with absolute
         * coordinates in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        cutPolygon : function(polygon, depth, cutProperties, safeZ) {
            "use strict";
            if(polygon.length < 3) {
                return false;
            }

            var t = new api.TabProperties();
            return this.cutPolygonWithTabs(polygon, depth, cutProperties, t, safeZ);
        },

        // NOT WORKING, DO NOT USE YET
        // dogbone is boolean
        pocketInnerConvexPolygon : function(tips, depth, cutProperties, dogbone, safeZ) {
            "use strict";

            // The number of iterations is according to the inner polygon so we
            // cannot calculate it and get normalized vectors at the same time.

            // TODO: wrong alrorigthm for finding the inner polygon
            // it should be the "x" side spaced by bitDiameter / 2 and
            // the "y" side spaced by bitDiameter / 2
            function getInnerPolygon(tips, center, bitDiameter) {
                var i = 0;
                var innerPolygon = [];
                var vector;

                for(i = 0; i < tips.length; i++) {
                    vector = new api.math.Vector(
                        center.x - tips[i].x, center.y - tips[i].y, 0
                    );
                    vector = vector.normalizedVector();
                    innerPolygon.push(new api.math.Vector(
                        tips[i].x + vector.x * bitDiameter / 2,
                        tips[i].y + vector.y * bitDiameter / 2,
                        0
                    ));
                }

                return innerPolygon;
            }

            if(tips.length < 3) {
                return false;
            }

            var deltaMove = cutProperties.offsetDistance();

            if(deltaMove === 0) {
                return false;
            }

            var center = api.math.barycenter2D(tips);
            var innerPolygon = getInnerPolygon(
                tips, center, cutProperties.bitDiameter
            );
            var biggestLength = 0;
            var numberIteration = 0;
            var i = 0;
            var n = 0;
            var deltaPath = [];
            var path = [];
            var outerPath = [];
            var currentZ = 0;
            var finalZ = -depth;
            var vector;
            var vectors = [];

            // Making the outer path
            if(dogbone === true) {
                for(i = 0; i < tips.length; i++) {
                    outerPath.push(innerPolygon[i]);
                    outerPath.push(tips[i]);
                    outerPath.push(innerPolygon[i]);
                }
            } else {
                outerPath = innerPolygon.slice();
            }
            outerPath.push(innerPolygon[0]);  // Closing the path

            for(i = 0; i < innerPolygon.length; i++) {
                vector = new api.math.Vector(
                    center.x - innerPolygon[i].x,
                    center.y - innerPolygon[i].y,
                    0
                );
                biggestLength = Math.max(vector.lengthSquared(), biggestLength);
                vectors.push(vector);
            }
            numberIteration = Math.sqrt(biggestLength) / deltaMove;

            if(numberIteration === 0) {
                return false;
            }

            for(i = 0; i < vectors.length; i++) {
                deltaPath.push(new api.math.Vector(
                        vectors[i].x / numberIteration,
                        vectors[i].y / numberIteration,
                        0
                ));
            }

            // Closing all paths before doing cuts
            vectors.push(vectors[0]);
            deltaPath.push(deltaPath[0]);
            innerPolygon.push(innerPolygon[0]);

            console.log("innerPolygon");
            console.log(innerPolygon);

            // var startCode = this.jogTo(
            //     new api.math.Vector(
            //         center.x, center.y, safeZ
            //     )
            // );

            var startCode = this.jogTo(
                new api.math.Vector(
                    innerPolygon[0].x + numberIteration * deltaPath[0].x,
                    innerPolygon[0].y + numberIteration * deltaPath[0].y,
                    safeZ
                )
            );

            currentZ = 0;
            finalZ = -depth;
            while(currentZ > finalZ) {
                currentZ = Math.max(currentZ - cutProperties.passDepth, finalZ);

                // Starting by numberIteration to cut inside-out

                // n is a float, do not try to be smart by using a for here!
                // Starting by numberIteration to cut inside-out
                // The + 1 to enable the execution when n = 0
                n = numberIteration + 1;
                while(n > 0) {
                    n = Math.max(n - 1, 0);
                    for(i = 0; i < innerPolygon.length; i++) {
                        path.push(new api.math.Vector(
                                innerPolygon[i].x + n * deltaPath[i].x,
                                innerPolygon[i].y + n * deltaPath[i].y,
                                currentZ
                        ));
                    }
                    n--;
                }

                for(i = 0; i < outerPath.length; i++) {
                    path.push(new api.math.Vector(
                            outerPath[i].x, outerPath[i].y, currentZ
                    ));
                }

            }

            return startCode + this.cutPath(path, cutProperties.feedrate, safeZ);
        },

        /**
         * Generates G-Code for pocketing the convex polygon. The order of the
         * polygon tips is important. The bit will go to a point to the next
         * one and close the polygon by going from the last point to the first
         * point. It cuts the outer sides, so make sure you specify an inner
         * polygon if you do not want the bit to follow the polygon path. The
         * polygon is considered 2D on the XY plane. If the polygon is not
         * convex, the behaviour is undefined. It is assumed that the bit is
         * above the board.
         *
         * @memberof api.gcode
         * @param {Vector[]} polygon - The polygon tip points with absolute
         * coordinates in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        pocketConvexPolygon : function(polygon, depth, cutProperties, safeZ) {
            "use strict";
            if(polygon.length < 3) {
                return false;
            }

            var completePolygon = polygon.slice();
            completePolygon.push(completePolygon[0]);
            var deltaMove = cutProperties.offsetDistance();

            if(deltaMove === 0) {
                return false;
            }

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
                vector = new api.math.Vector(
                    center.x - polygon[i].x,
                    center.y - polygon[i].y,
                    0
                );
                biggestLength = Math.max(vector.lengthSquared(), biggestLength);
                vectors.push(vector);
            }
            vectors.push(vectors[0]);  //To follow completePolygon
            numberIteration = Math.sqrt(biggestLength) / deltaMove;

            if(numberIteration === 0) {
                return false;
            }

            console.log("Convex normal: numberIteration = " + numberIteration);

            for(i = 0; i < numberPoints; i++) {
                deltaPath.push(new api.math.Vector(
                        vectors[i].x / numberIteration,
                        vectors[i].y / numberIteration,
                        0
                ));
            }
            deltaPath.push(deltaPath[0]);  //To follow completePolygon

            var startCode = this.jogTo(
                new api.math.Vector(
                    completePolygon[0].x + numberIteration * deltaPath[0].x,
                    completePolygon[0].y + numberIteration * deltaPath[0].y,
                    safeZ
                )
            );
            currentZ = 0;
            finalZ = -depth;
            while(currentZ > finalZ) {
                currentZ = Math.max(currentZ - cutProperties.passDepth, finalZ);

                // n is a float, do not try to be smart by using a for here!
                // Starting by numberIteration to cut inside-out
                // The + 1 to enable the execution when n = 0
                n = numberIteration + 1;
                while(n > 0) {
                    n = Math.max(n - 1, 0);
                    for(i=0; i < numberPoints + 1; i++) {
                        path.push(new api.math.Vector(
                                completePolygon[i].x + n * deltaPath[i].x,
                                completePolygon[i].y + n * deltaPath[i].y,
                                currentZ
                        ));
                    }
                    n--;
                }
            }

            return startCode + this.cutPath(path, cutProperties.feedrate, safeZ);
        },

        /**
         * Generates G-Code for pocketing the polygon. The order of the polygon
         * tips is important. The bit will go to a point to the next one and
         * close the polygon by going from the last point to the first point.
         * The polygon is considered 2D on the XY plane. It is assumed that the
         * bit is above the board.
         *
         * @memberof api.gcode
         * @requires earcut.js
         * @param {Vector[]} polygon - The polygon tip points with absolute
         * coordinates in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string} The generated G-Code.
         */
        pocketSimplePolygon : function(polygon, depth, cutProperties, safeZ) {
            "use strict";

            function convertVertexToPoint(earcutPolygon, vertexIndex) {
                var xIndex = vertexIndex * 2;  // 2 because 2D
                return new api.math.Vector(
                    earcutPolygon[xIndex],
                    earcutPolygon[xIndex + 1],
                    0
                );
            }

            function convertTriangleVertexIndicesToTriangle(
                earcutPolygon, a, b, c
            ) {
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

            // Returns a clockwise copy of the polygon.
            function getClockwisePolygon(polygon) {
                if(api.math.isClockwisePolygon(polygon) === true) {
                    return polygon.slice();
                }
                return polygon.slice().reverse();
            }

            // Returns the aggregation of the two polygons if they share a side
            // and the aggregation makes a convex polygon. If not, return an
            // empty array. The polygon would be clockwise.
            // Does not test if the polygons overlap.
            function aggregate(polygon1, polygon2) {
                var p1 = getClockwisePolygon(polygon1);
                var p2 = getClockwisePolygon(polygon2);
                var i = 0;
                var j = 0;

                var aggregation = [];
                var foundShareSide = false;
                // Indices for the shared size
                var iP1V1 = -1;
                var iP1V2 = -1;
                var iP2V1 = -1;
                var iP2V2 = -1;

                var iNext = 0;
                var jNext = 0;

                // The polygons p1 and p2 are clockwise. If they have a common
                // edge defined by the vertices v1 and v2.
                // p1 will always be defined in this order:
                //   [other vertices, v1, v2, other vertices]
                // p2 will always be defined in this order:
                //   [other vertices, v2, v1, other vertices]
                //
                // If p2 is defined in the same order than p1, this means p2
                // overlaps p1 for sure. This case is not managed by this
                // algorithm so it is considered as if p1 and p2 do not have a
                // common edge.

                // Find if share side
                for(i = 0; i < p1.length; i++) {
                    for(j = 0; j < p2.length; j++) {
                        if(p1[i].equal(p2[j]) !== true) {
                            continue;
                        }

                        iNext = (i + 1) % p1.length;
                        jNext = ((j - 1) < 0) ? (p2.length - 1) : (j - 1);

                        if(p1[iNext].equal(p2[jNext]) === true) {
                            foundShareSide = true;
                            iP1V1 = i;
                            iP1V2 = iNext;
                            iP2V1 = j;
                            iP2V2 = jNext;
                            break;
                        }
                    }
                    if(foundShareSide === true) {
                        break;
                    }
                }

                if(foundShareSide === false) {
                    return [];
                }

                // Start aggregation

                // Adding p1 from v1 (included) to v2 with other vertices
                i = iP1V1;
                while(i !== iP1V2) {
                    aggregation.push(p1[i]);
                    i--;
                    if(i < 0) {
                        i = p1.length - 1;
                    }
                }

                // Adding p2 from v2 (included) to v1 with other vertices
                i = iP2V2;
                while(i !== iP2V1) {
                    aggregation.push(p2[i]);
                    i--;
                    if(i < 0) {
                        i = p2.length - 1;
                    }
                }

                // End aggreation

                aggregation = getClockwisePolygon(aggregation);
                return (api.math.isConvexPolygon(aggregation)) ? aggregation : [];
            }

            // Aggragates triangles in convex polygons
            function aggregateTriangles(triangles) {
                var polygons = triangles.slice();
                var polygonTemp = [];
                var iCurrent = 0;
                var i = 0;

                var hasAggregated = true;
                // Repeat until there is no more aggregation
                while(hasAggregated === true) {
                    hasAggregated = false;
                    // Length is changing, do not be smart with polygons.length
                    for(iCurrent = 0; iCurrent < polygons.length; iCurrent++) {

                        // For each next polygons (triangles), try to aggregate
                        for(i = polygons.length - 1; i > iCurrent; i--) {
                            polygonTemp = aggregate(
                                polygons[iCurrent], polygons[i]
                            );
                            if(polygonTemp.length > 0) {
                                polygons[iCurrent] = polygonTemp;
                                polygons.splice(i, 1);
                                hasAggregated = true;
                            }
                        }

                    }
                }
                return polygons;
            }

            var triangles = triangulatePolygon(polygon);
            var polygons = aggregateTriangles(triangles);
            var polygonCode;
            var code = "";
            var i = 0;

            for(i = 0; i < polygons.length; i++) {
                polygonCode = this.pocketConvexPolygon(
                    polygons[i], depth, cutProperties, safeZ
                );
                if(polygonCode === false) {
                    return false;
                }
                code += polygonCode;
            }

            return code;
        },

        /**
         * Generates G-Code for cutting the circle and letting tabs. The circle
         * is considered 2D on the XY plane. Use this function if you cut
         * completely. It is assumed that the bit is above the board.
         * through the material.
         *
         * @memberof api.gcode
         * @param {Vector} center - The circle center with absolute coordinates
         * in inches.
         * @param {number} radius - The radius in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {TabProperties} tabProperties - The tabs properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        cutCircleWithTabs : function(
            center, radius, depth, cutProperties, tabProperties, safeZ
        ) {
            "use strict";
            if(radius === 0) {
                return false;
            }

            var start = new api.math.Vector(center.x + radius, center.y, 0);
            var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
            var useTabs = tabProperties.isUsed();
            var codeTabs = [];
            var code = [];
            var str = "";
            var tabAngle = 0;
            var normalAngle = 0;
            var end;
            var finalZ = -depth;
            var currentZ = 0;
            var tabZ = tabProperties.height - depth;

            var codeWithoutTab = "G3 X" + start.x.toFixed(5);
            codeWithoutTab += " Y" +start.y.toFixed(5);
            codeWithoutTab += " I" + (-radius).toFixed(5) + feedrateString;

            if(useTabs === true) {
                //perimeter = 2*pi*r; ratio = tabWidth / perimeter;
                //tabAngle = 360 * ratio;
                tabAngle = (180 * tabProperties.width) / (Math.PI * radius);
                if(tabAngle >= tabProperties.MAX_ANGLE) {
                    console.log("Tab angle = " + tabAngle);
                    useTabs = false;
                } else {
                    normalAngle = 180 - tabAngle;

                    end = api.math.rotation2D(start, center, normalAngle, 1);
                    str = "G3 X" + end.x.toFixed(5) + " Y" + end.y.toFixed(5);
                    str += " R" + radius.toFixed(5) + feedrateString;
                    codeTabs.push(str);

                    end = api.math.rotation2D(end, center, tabAngle, 1);
                    str = "G3 X" + end.x.toFixed(5) + " Y" + end.y.toFixed(5);
                    str += " R" + radius.toFixed(5) + feedrateString;
                    codeTabs.push(str);

                    end = api.math.rotation2D(end, center, normalAngle, 1);
                    str = "G3 X" + end.x.toFixed(5) + " Y" + end.y.toFixed(5);
                    str += " R" + radius.toFixed(5) + feedrateString;
                    codeTabs.push(str);

                    //To make sure we close the circle, we go to start:
                    str = "G3 X" + start.x.toFixed(5) + " Y" + start.y.toFixed(5);
                    str += " R" + radius.toFixed(5) + feedrateString;
                    codeTabs.push(str);
                }
            }

            str = "G1 X" + start.x.toFixed(5) + " Y" + start.y.toFixed(5);
            str += feedrateString;
            code.push(str);
            code.push(this.selectXYPlane());

            finalZ = -depth;
            currentZ = 0;
            while(currentZ > finalZ) {
                currentZ = Math.max(currentZ - cutProperties.passDepth, finalZ);
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

            return code.join('\n') + '\n';
        },

        /**
         * Generates G-Code for cutting a circle. The circle is considered 2D
         * on the XY plane. Do not use this function if you cut completely
         * through the material: you need tabs for that. Without tabs, the
         * cutting part can be thrown because of the spindle rotation. It is
         * assumed that the bit is above the board.
         *
         * @memberof api.gcode
         * @param {Vector} center - The circle center with absolute coordinates
         * in inches.
         * @param {number} radius - The radius in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        cutCircle : function(center, radius, depth, cutProperties, safeZ) {
            "use strict";
            var t = new api.TabProperties();
            return this.cutCircleWithTabs(
                center, radius, depth, cutProperties, t, safeZ
            );
        },

        /**
         * Generates G-Code for pocketing a circle. The circle is considered 2D
         * on the XY plane. It is assumed that the bit is above the board.
         *
         * @memberof api.gcode
         * @param {Vector} center - The circle center with absolute coordinates
         * in inches.
         * @param {number} radius - The radius in inches.
         * @param {number} depth - The depth in inches.
         * @param {CutProperties} cutProperties - The cut properties.
         * @param {number} [safeZ] - The safe Z position to go after the cut in
         * inches.
         * @return {string|boolean} The generated G-Code or false if impossible
         * to parse the given polygon.
         */
        pocketCircle : function(center, radius, depth, cutProperties, safeZ) {
            "use strict";
            if(cutProperties.bitDiameter > radius * 2) {
                return false;
            }

            var deltaMove = cutProperties.offsetDistance();
            if(deltaMove === 0) {
                return false;
            }

            var newX = 0;
            var deltaRadius = 0;
            var code = [];
            var feedrateString = " F" + cutProperties.feedrate.toFixed(5);
            var currentZ = 0;
            var finalZ = -depth;
            var codeGoCenter = "G1 X" + center.x.toFixed(5);
            codeGoCenter += " Y" + center.y.toFixed(5) + feedrateString;

            code.push(this.selectXYPlane());

            while(currentZ > finalZ) {
                currentZ = Math.max(currentZ - cutProperties.passDepth, finalZ);
                //From inside to outside
                code.push(codeGoCenter);
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

            return code.join('\n') + '\n';
        }
    };
}());
