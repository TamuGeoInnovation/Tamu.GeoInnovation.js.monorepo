# common-node-images

Image helpers for the Node APIs. `fitImage` scales an uploaded JPEG or PNG down to the size it is shown at and removes its
metadata (EXIF, which can hold a location). An image with no transparency is encoded as a JPEG, and also as a PNG when it
came in as one; one with transparency is a PNG. The smallest is stored, and an image already within the size keeps its
original bytes unless re-encoding saves a tenth, so a resized image is not larger than the upload (#2426). It is pure
JavaScript (jimp), so untrusted uploads are never decoded in native code.

Used for GIS Day speaker photos (#2352). Sponsor logos are stored the same way and could use it too.
