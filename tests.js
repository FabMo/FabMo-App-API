/*jslint todo: true, browser: true, continue: true, white: true*/
/*global api*/

/**
 * Units tests are done here. Only errors are displayed in the console.
 */

// A regular polygon is a convex polygon with same size sides
//Returns a regular polygon
function getRegularPolygon() {
    return [
        new api.math.Vector(0, 0, 0),
        new api.math.Vector(1, 0, 0),
        new api.math.Vector(2, 1, 0),
        new api.math.Vector(2, 3, 0),
        new api.math.Vector(1, 4, 0),
        new api.math.Vector(-1, 4, 0),
        new api.math.Vector(-2, 3, 0),
        new api.math.Vector(-2, 1, 0)
    ];
}

//Returns a convex non regular polygon
function getConvexPolygon() {
    return [
        new api.math.Vector(1, 1, 0),
        new api.math.Vector(1, 2, 0),
        new api.math.Vector(2, 2, 0),
        new api.math.Vector(2, 1, 0),
    ];
}

// Returns a polygon with an angle superior to 180 degree
function getNonConvexPolygon() {
    return [
        new api.math.Vector(-1, -2, 3),
        new api.math.Vector(0, -3, 1),
        new api.math.Vector(3, -3, 0),
        new api.math.Vector(0, -2, 3),
        new api.math.Vector(4, 1, 0),
        new api.math.Vector(0, 3, 2),
        new api.math.Vector(-1, 2, 2),
    ];
}

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
        console.log("Error for angleSignPoints (supposed to be the same).");
        return;
    }

    var cba = api.math.angleSignPoints(b, c, a);
    if(abc === cba) {
        console.log("Error for angleSignPoints (supposed to be different).");
        return;
    }

    console.log("testGeneral OK");
}

function testPolygon() {
    var regularPolygon = getRegularPolygon();

    if(api.math.isConvexPolygon(regularPolygon) === false) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    var convexPolygon = getConvexPolygon();

    if(api.math.isConvexPolygon(convexPolygon) === false) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    var polygon180 = getNonConvexPolygon();

    if(api.math.isConvexPolygon(polygon180) === true) {
        console.log("Error for api.math.isConvexPolygon.");
        return;
    }

    console.log("testPolygon OK");
}

function testTabProperties() {
    var tabNotUsed = new api.TabProperties();
    if(tabNotUsed.isUsed() === true) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Used with a width and a height undefined.");
        return;
    }

    tabNotUsed = new api.TabProperties(0, 1);
    if(tabNotUsed.isUsed() === true) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Used with a width equals to 0.");
        return;
    }

    tabNotUsed = new api.TabProperties(1, 0);
    if(tabNotUsed.isUsed() === true) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Used with a height equals to 0.");
        return;
    }

    tabNotUsed = new api.TabProperties(-1, 1);
    if(tabNotUsed.isUsed() === true) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Used with a width inferior to 0.");
        return;
    }

    tabNotUsed = new api.TabProperties(1, -1);
    if(tabNotUsed.isUsed() === true) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Used with a height inferior to 0.");
        return;
    }

    tabNotUsed = new api.TabProperties(-3, -1);
    if(tabNotUsed.isUsed() === true) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Used with a width and a height < 0");
        return;
    }

    var tabUsed = new api.TabProperties(3, 1);
    if(tabUsed.isUsed() === false) {
        console.log("Error for TabProperties.isUsed().");
        console.log("Not used with a width and a height > 0");
        return;
    }

    console.log("testTabProperties OK");
}

// This function only calls functions. Used to see if functions crash.
function simpleCalls() {
    api.gcode.cutCircleWithTabs(
        new api.math.Vector(), 5, 3, new api.CutProperties(1, 2, 0.3, 120),
        new api.TabProperties(0.4, 0.3), 3
    );
}

testPoints();
testGeneral();
testPolygon();
testTabProperties();
simpleCalls();
