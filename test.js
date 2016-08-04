/*jslint todo: true, browser: true, continue: true, white: true*/
/*global api*/

/**
 * Units tests are done here. Only errors are displayed in the console.
 */

function testPoints() {
    var x = 5, y = 8;
    var point2D = api.math.createVector(x, y, 0);
    var point2DAuto = api.math.createVector(x, y);
    if(api.math.vectorEqual(point2D, point2DAuto) === false) {
        console.log("Error in point creation.");
        return;
    }

    var u = api.math.createVector(1, 0, 0);
    var v = api.math.createVector(1, 1, 0);
    var w = api.math.createVector(1, -1, 0);
    var crossUV = api.math.cross(u, v);
    var crossUW = api.math.cross(u, w);
    if(api.math.vectorEqual(crossUV, api.math.createVector(0, 0, 1)) === false) {
        console.log("Error in api.math.cross.");
        console.log("crossUV: ");
        console.log(crossUV);
        return;
    }
    if(api.math.vectorEqual(crossUW, api.math.createVector(0, 0, -1)) === false) {
        console.log("Error in api.math.cross.");
        console.log("crossUW: ");
        console.log(crossUW);
        return;
    }

    console.log("testPoints OK");
}

function testGeneral() {
    var quarterPi = Math.PI / 4;
    if(api.math.nearlyEqual(Math.cos(quarterPi), Math.sin(quarterPi)) === false) {
        console.log("Error for api.math.nearlyEqual.");
        console.log(Math.cos(quarterPi) + " != " +  Math.sin(quarterPi));
        return;
    }

    var a = api.math.createVector(1, 0);
    var b = api.math.createVector(1, 1);
    var c = api.math.createVector(0, 1);
    var abc = api.math.angleSignPoints(b, a, c);
    var bca = api.math.angleSignPoints(c, b, a);
    if(abc !== bca) {
        console.log("Error for angleSignPoints.");
        return;
    }

    console.log("testGeneral OK");
}

function testPolygon() {
    // A regular polygon is a convex polygon with same size sides
    var regularPolygon = [
        api.math.createVector(0, 0, 0),
        api.math.createVector(1, 0, 0),
        api.math.createVector(2, 1, 0),
        api.math.createVector(2, 3, 0),
        api.math.createVector(1, 4, 0),
        api.math.createVector(-1, 4, 0),
        api.math.createVector(-2, 3, 0),
        api.math.createVector(-2, 1, 0)
    ];

    if(api.math.isConvexPolygon(regularPolygon) === false) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    // A convex polygon
    var convexPolygon = [
        api.math.createVector(1, 1, 0),
        api.math.createVector(1, 2, 0),
        api.math.createVector(2, 2, 0),
        api.math.createVector(2, 1, 0),
    ];

    if(api.math.isConvexPolygon(convexPolygon) === false) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    // A polygon with an angle superior to 180 degree
    var polygon180 = [
        api.math.createVector(-1, -2, 3),
        api.math.createVector(0, -3, 1),
        api.math.createVector(3, -3, 0),
        api.math.createVector(0, -2, 3),
        api.math.createVector(4, 1, 0),
        api.math.createVector(0, 3, 2),
        api.math.createVector(-1, 2, 2),
    ];

    if(api.math.isConvexPolygon(polygon180) === true) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    console.log("testPolygon OK");
}

testPoints();
testGeneral();
testPolygon();
