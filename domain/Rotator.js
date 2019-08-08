/**
 * @description Class to represent a single Pixel in an image.
 */
class Pixel {
    /**
     * @param {array} data representing a one-dimensional array containing the data in the RGBA order, with integer values between 0 and 255 (inclusive).
     * @param {number} index representing an index (positive integer) used to extract the Pixel from the given data array.
     * @throws {RangeError} Throws RangeError when the index or data array were invalid.
     */
    constructor(data, index) {
        if (index < 0 || index > data.length) throw new RangeError();
        this._r = data[index];
        this._g = data[index + 1];
        this._b = data[index + 2];
        this._a = data[index + 3];
    }

    /**
     * @description Gets the RED value (an integer value between 0 and 255, inclusive).
     */
    get r() {
        return this._r;
    }

    /**
     * @description Gets the GREEN value (an integer value between 0 and 255, inclusive).
     */
    get g() {
        return this._g;
    }

    /**
     * @description Gets the BLUE value (an integer value between 0 and 255, inclusive).
     */
    get b() {
        return this._b;
    }

    /**
     * @description Gets the ALPHA value (an integer value between 0 and 255, inclusive).
     */
    get a() {
        return this._a;
    }

    /**
     * @description Creates a new black pixel transparent (ALPHA = 0)
     * @returns new instance of a transparent pixel
     */
    static transparentPixel() {
        return new Pixel([0, 0, 0, 0], 0);
    }

    /**
     * @description Check the if the given pixel is undefined or transparent.
     * @param {Pixel} pixel Represents the pixel to test.
     * @returns Returns true when the pixel is undefined or when the pixel alpha is equals to zero, otherwise returns false;
     */
    static isTransparentOrInvalid(pixel) {
        return !pixel || pixel.a == 0;
    }

    /**
     * @description Check if the given pixel is out of the bounds of the image matrix
     * @param {Pixel[][]} matrix Pixel matrix that represents the image
     * @param {Number} neighborRow Row index (positive integer) of the adjacent pixel to check
     * @param {Number} neighborColumn Column index (positive integer) of the adjacent pixel to check
     * @returns Returns true when one of the indexes are out of the bounds of the matrix, otherwise returns false.
     */
    static isOutOfBounds(matrix, neighborRow, neighborColumn) {
        return neighborRow < 0 ||
            neighborRow >= matrix.length ||
            neighborColumn < 0 ||
            neighborColumn >= matrix[neighborRow].length;
    }

    /**
     * @description get all adjacent Pixels (including diagonals)
     * @param {Pixel[][]} matrix Pixel matrix that represents the image
     * @param {Number} row Row index (positive integer) of the pixel to get the neighbors
     * @param {Number} column Column index (positive integer) of the adjacent pixel to get the neighbors
     * @returns Returns all valid (not transparent nor out of bounds) neighbors for the antialiasing process
     */
    static getNeighbors(matrix, row, column) {
        let neighbors = [];
        for (let neighborRow = row - 1; neighborRow <= row + 1; neighborRow++) {
            for (let neighborColumn = column - 1; neighborColumn <= column + 1; neighborColumn++) {
                if (!Pixel.isOutOfBounds(matrix,neighborRow, neighborColumn)
                    && !(neighborRow == row && neighborColumn == column)
                    && !Pixel.isTransparentOrInvalid(matrix[neighborRow][neighborColumn]))

                    neighbors.push(matrix[neighborRow][neighborColumn]);
            }
        }

        return neighbors;
    }

    /**
     * @description Create a new pixel based on the neighborhood
     * @param {Pixel[]} neighbors Adjacent pixels to calculate the average RGB
     * @returns Returns a new instance of Pixel based on the neighborhood.
     */
    static getAverageRGB(neighbors){
        let totalR = 0, totalG = 0, totalB = 0;

        for (let neighbor of neighbors) {
            totalR += neighbor.r;
            totalG += neighbor.g;
            totalB += neighbor.b;
        }

        return new Pixel([
            parseInt(totalR / neighbors.length),
            parseInt(totalG / neighbors.length),
            parseInt(totalB / neighbors.length),
            255
        ], 0);
    }

    /**
     * @description Create a new pixel based on the average of the neighbors pixels.
     * @param {Pixel[][]} matrix Pixel matrix that represents the image
     * @param {Number} row Row index (positive integer) of the pixel to apply the antialiasing process
     * @param {Number} column Column index (positive integer)of the pixel to apply the antialiasing process
     * @returns a new Pixel based on its neighbors
     * @throws {RangeError} Throws RangeError when the row or column are invalid matrix indexes.
     */
    static antialiasing(matrix, row, column) {
        if (Pixel.isOutOfBounds(matrix,row, column)) throw new RangeError();

        let pixel = matrix[row][column];
        let neighbors = Pixel.getNeighbors(matrix,row,column);

        if (neighbors.length > 3) {
            pixel = Pixel.getAverageRGB(neighbors);
        }

        return pixel;
    }
}

/**
 * @description Constant that represents 90 degrees in radians.
 */
const NINETY_DEGREES_IN_RADIAN = 1.5708;
/**
 * @description Constant that represents 360 degrees in radians.
 */
const THREE_SIXTY_DEGREES_IN_RADIAN= 6.28319;

/**
 * @description Class to encapsulate the logic to rotate an image.
 */
class Rotator {
    
    /** 
    * @description Rotates the image around its centre, to angle radius clockwise parameter.  
    * @param {ImageData} image The image to rotate.  
    * @param {number} angle The angle (radians) to clockwise rotation about the centre of the image.  
    * @returns {ImageData} A new rotate image based on the original image and the angle.
    * @throws {TypeError} When the parameter image is not an ImageData or angle is not a positive number.
    */
    rotate(image, angle) {
        if (this.invalidParameters(image, angle)) throw new TypeError();

        let squareMatrix = this.createPixelImageMatrix(image);
        let [scaledMatrix, widthIncreased, heightIncreased] = this.scaleMatrix(squareMatrix, angle);
        
        let rotatedMatrix = this.rotateMatrix(scaledMatrix, widthIncreased, heightIncreased, angle);
        
        let antialiasedMatrix = this.antialiasing(rotatedMatrix);

        return this.createNewImageArray(antialiasedMatrix);
    }

    /**
     * @description Create a Pixel matrix based on ImageData object
     * @param {ImageData} image  ImageData object to create the Pixel matrix
     * @returns A new instance of a Pixel matrix
     */
    createPixelImageMatrix(image) {
        let height = image.height;
        let width = image.width;
        let originalHeight = height;
        let originalWidth = width;
        let heightIncreased = 0;
        let widthIncreased = 0;
        if (height > width) {
            width = height;
        } else {
            height = width;
        }
        heightIncreased = parseInt((height - originalHeight)/2);
        widthIncreased = parseInt((width - originalWidth)/2);

        let matrix = Array(height).fill().map(() => Array(width).fill());
        let index = 0;
        for (let row = heightIncreased; row < height; row++) {
            for (let column = widthIncreased; column < width; column++) {
                if(index >= image.data.length){
                    matrix[row][column] = Pixel.transparentPixel();
                }
                else {
                    matrix[row][column] = new Pixel(image.data, index);
                    index += 4;
                }
            }
        }
        return matrix;
    }

    /**
     * @description Scale the Pixel matrix to the new size according to the rotation
     * @param {Pixel[][]} matrix Image Pixel matrix to scale to according the angle
     * @param {Number} angle Angle in Radians
     * @returns Returns an array (size 3) containing the new Pixel matrix with different sizes than the original image, 
     * The quantity of Pixels that the image increase horizontally and vertically, respectivelly
     */
    scaleMatrix(matrix, angle) {
        let height = matrix.length;
        let width = matrix[0].length;
        let [newWidth, newHeight] = this.getImageSize(width, height, angle);
        let heightIncreased = parseInt((newHeight - height) / 2);
        let widthIncreased = parseInt((newWidth - width) / 2);
        let scaledMatrix = Array(newHeight).fill(Pixel.transparentPixel())
            .map(() => Array(newWidth)
            .fill(Pixel.transparentPixel()));

        for (let row = heightIncreased; row < height + heightIncreased; row++) {
            for (let column = widthIncreased; column < width + widthIncreased; column++) {
                scaledMatrix[row][column] = matrix[row - heightIncreased][column - widthIncreased];
            }
        }
        return [scaledMatrix, widthIncreased, heightIncreased];
    }

    /**
     * @description Calculate the new position of each Pixel in the Image matrix
     * @param {Pixel[][]} matrix Image Pixel matrix to scale to according the angle
     * @param {Number} widthIncreased The quantity of Pixels that the image increase horizontally
     * @param {Number} heightIncreased The quantity of Pixels that the image increase vertically
     * @param {Number} angle Angle in Radians to rotate the image
     * @returns A new Pixel matrix rotated by the given angle
     */
    rotateMatrix(matrix, widthIncreased, heightIncreased, angle) {
        let height = matrix.length;
        let width = matrix[0].length;

        let rotatedMatrix = Array(height)
            .fill(Pixel.transparentPixel()).map(() => Array(width)
            .fill(Pixel.transparentPixel()));

        let centralRow = parseInt(height / 2);
        let centralColumn = parseInt(width / 2);

        for (let row = 0; row < height - widthIncreased; row++) {
            for (let column = 0; column < width - heightIncreased; column++) {
                let [newRow, newColumn] = this.rotateXY(centralRow, centralColumn, row, column, angle);
                let pixel = matrix[row][column];
                if (newRow < rotatedMatrix.length && newColumn < rotatedMatrix[0].length)
                    rotatedMatrix[newRow][newColumn] = pixel;
            }
        }

        return rotatedMatrix;
    }

    /**
     * @description Calculate new values of each transparent Pixel surroundend with 4 or more valid pixels in the Image matrix
     * @param {Pixel[][]} matrix Image Pixel matrix to scale to according the angle
     * @returns Returns a new Pixel image after the antialiasing process.
     */
    antialiasing(matrix) {
        for (let row = 0; row < matrix.length; row++) {
            for (let column = 0; column < matrix[0].length; column++) {
                let pixel = matrix[row][column];
                if (Pixel.isTransparentOrInvalid(pixel)) {
                    pixel = Pixel.antialiasing(matrix, row, column);
                }
                matrix[row][column] = pixel;
            }
        }
        return matrix;
    }

    /**
     * @description Create a new ImageData object based on the given Pixel matrix.
     * @returns Returns a new ImageData object based on the given Pixel matrix.
     * @param {Pixel[][]} antialisedMatrix Image Pixel matrix to convert to a new image data array.
     */
    createNewImageArray(antialisedMatrix) {
        const newimageData = {
            width: antialisedMatrix.length,
            height: antialisedMatrix[0].length,
            data: []
        };

        let dataArray = this.toDataArray(antialisedMatrix);
        for (let i = 0; i < dataArray.length; i++) {
            newimageData.data[i] = dataArray[i];
        }

        return newimageData;
    }


    /**
     * @description Apply the operations Round and Absolute in a given number.
     * @summary e.g. (-1.6) -> 2 || (2.1) -> 2 || (-2) -> 2
     * @param {Number} number Number to be normalized (Rounded + Absolute)
     * @returns Returns the absolute rounded number according the given parameter
     */
    normalizeNumber(number) {
        return Math.abs(Math.round(number));
    }

    /**
     * @description Convert an angle in Degrees to Radians
     * @param {Number} angle Angle in Degrees
     * @returns The given angle, but in Radians
     */
    degreesToRadian(angle) {
        return angle * (Math.PI / 180);
    }

    /**
     * 
     * @param {ImageData} image The image to check if it is valid
     * @param {Number} angle The angle to check if it is valid. 
     */
    invalidParameters(image, angle) {
        return typeof image !== "object"
            || !image.data
            || !image.height
            || !image.width
            || typeof angle !== "number"
            || angle < 0
            || angle > THREE_SIXTY_DEGREES_IN_RADIAN;
    }

    /**
     * @description Return the new size of the Image
     * @param {Number} width Original width of the Image 
     * @param {Number} height Original height of the Image 
     * @param {Number} angle Angle (in Radians) to rotate the image (clockwise)
     * @returns An array (size 2) containing the new width and the new height respectivelly
     */
    getImageSize(width, height, angle) {
        while (angle > NINETY_DEGREES_IN_RADIAN) {
            angle -= NINETY_DEGREES_IN_RADIAN;
        }
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let newHeight, newWidth;

        newWidth = (width * cos) + (height * sin);
        newHeight = (width * sin) + (height * cos);

        return [this.normalizeNumber(newWidth), this.normalizeNumber(newHeight)];
    }

    /**
     * @description Calculate the new X and Y positions based on the given parameters.
     * @param {Number} centralRow Central row of the image to use as 0,0 in the rotation matrix.
     * @param {Number} centralColumn Central column of the image to use as 0,0 in the rotation matrix.
     * @param {Number} row row to calculate the new position
     * @param {Number} column column to calculate the new position
     * @param {Number} radians angle to rotate the pixel.
     * @returns An array (size 2) containing the new positions X and y respectivelly.
     */
    rotateXY(centralRow, centralColumn, row, column, radians) {
        let cos = Math.cos(radians),
            sin = Math.sin(radians),
            newX = (cos * (row - centralRow)) + (sin * (column - centralColumn)) + centralRow,
            newY = (cos * (column - centralColumn)) - (sin * (row - centralRow)) + centralColumn;
        return [this.normalizeNumber(newX), this.normalizeNumber(newY)];
    }

    /**
     * @description Push all values (RGBA) of the given pixel into the data array
     * @param {Number[]} dataArray Data array that represents an Image in a DataImage object
     * @param {Pixel} pixel Pixel to insert in the data array.
     */
    pushPixel(dataArray, pixel) {
        dataArray.push(pixel.r);
        dataArray.push(pixel.g);
        dataArray.push(pixel.b);
        dataArray.push(pixel.a);
    }

    /**
     * @description Convert back the Pixel matrix to an data array.
     * @param {Pixel[][]} matrix Image Pixel matrix to convert to a new image data array.
     */
    toDataArray(matrix) {
        let dataArray = [];
        for (let row = 0; row < matrix.length; row++) {
            for (let column = 0; column < matrix[0].length; column++) {
                var pixel = matrix[row][column];
                if (pixel) {
                    this.pushPixel(dataArray, pixel);
                }
                else {
                    this.pushPixel(dataArray, Pixel.transparentPixel());
                }
            }
        }

        return dataArray;
    }
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Rotator;
else
    window.Rotator = Rotator;