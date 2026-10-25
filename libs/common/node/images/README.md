# common-node-images

Image helpers for the Node APIs. `fitImage` scales an uploaded JPEG or PNG down to the size it is shown at, re-encodes it
in its own format and removes its metadata (EXIF, which can hold a location). It is pure JavaScript (jimp), so untrusted
uploads are never decoded in native code.

Used for GIS Day speaker photos (#2352). Sponsor logos are stored the same way and could use it too.
