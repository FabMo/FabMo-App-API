/*jslint todo: true, browser: true, continue: true, white: true*/
/*global api*/

/**
 * Units tests are done here. Only errors are displayed in the console.
 */

function testPoints() {
    var x = 5, y = 8;
    var point2D = new api.math.Vector(x, y, 0);
    var point2DAuto = new api.math.Vector(x, y);
    if(point2D.equal( point2DAuto) === false) {
        console.log("Error in point creation.");
        return;
    }

    var u = new api.math.Vector(1, 0, 0);
    var v = new api.math.Vector(1, 1, 0);
    var w = new api.math.Vector(1, -1, 0);
    var crossUV = api.math.Vector.cross(u, v);
    var crossUW = api.math.Vector.cross(u, w);
    if(crossUV.equal(new api.math.Vector(0, 0, 1)) === false) {
        console.log("Error in api.math.Vector.cross.");
        console.log("crossUV: ");
        console.log(crossUV);
        return;
    }
    if(crossUW.equal(new api.math.Vector(0, 0, -1)) === false) {
        console.log("Error in api.math.Vector.cross.");
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

    var a = new api.math.Vector(1, 0);
    var b = new api.math.Vector(1, 1);
    var c = new api.math.Vector(0, 1);
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
        new api.math.Vector(0, 0, 0),
        new api.math.Vector(1, 0, 0),
        new api.math.Vector(2, 1, 0),
        new api.math.Vector(2, 3, 0),
        new api.math.Vector(1, 4, 0),
        new api.math.Vector(-1, 4, 0),
        new api.math.Vector(-2, 3, 0),
        new api.math.Vector(-2, 1, 0)
    ];

    if(api.math.isConvexPolygon(regularPolygon) === false) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    // A convex polygon
    var convexPolygon = [
        new api.math.Vector(1, 1, 0),
        new api.math.Vector(1, 2, 0),
        new api.math.Vector(2, 2, 0),
        new api.math.Vector(2, 1, 0),
    ];

    if(api.math.isConvexPolygon(convexPolygon) === false) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    // A polygon with an angle superior to 180 degree
    var polygon180 = [
        new api.math.Vector(-1, -2, 3),
        new api.math.Vector(0, -3, 1),
        new api.math.Vector(3, -3, 0),
        new api.math.Vector(0, -2, 3),
        new api.math.Vector(4, 1, 0),
        new api.math.Vector(0, 3, 2),
        new api.math.Vector(-1, 2, 2),
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
