# FabMo-App-API

Library for helping FabMo app developpers.

This API uses the [earcut library](https://github.com/mapbox/earcut) for
pocketting non convex polygons (simple polygon).

All library files are under the folder ``lib`` which includes

* ``earcut.js`` : the earcut library
* ``api.js`` : the actual API

**This API is very unstable for the moment and the development is nonregular.**

## Mindset and assumptions

This API is quite minimalistic, it offers basic functionnalities needed in most
application projects (polygon and circle cut and pocketting, G-Code
generation...).

This API assumes the applications are made for 3 axis cnc machines. The Z axis
represents the height (positive) and the depth (negative). Polygons and circles
are in 2D in the plane XY.

We are open to suggestion for improving this API, any kind of feedback are
welcome.

## API organisation

[API documentation can be found here.](http://gofabmo.org/FabMo-App-API/)

API documentation can be generated by using
[JSDoc](https://github.com/jsdoc3/jsdoc). For generating the documentation, use:

    jsdoc lib/api.js README.md

The API is organized into namespaces. The main is ``api``, everything else lay
in this namespace.

* Static functions and constants for converting units into millimeters and
  inches are defined into the main namespace.
* ``api.CutProperties`` is a class defining the cut properties (bit size, feed
  rate and stepover).
* ``api.TabProperties`` is a class defining the tab properties. Tabs are used
  when cutting pieces through the boards (for avoiding having pieces violently
  ejected from the board).
* ``api.math`` defines mathematical functions.
* ``api.math.Vector`` is a class defining a 3D vector. It is also used for
  defining points.
