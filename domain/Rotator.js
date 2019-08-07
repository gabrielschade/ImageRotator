class Rotator {

    /** @description Rotates the image around its centre, to angle radius clockwise parameter.  
    * @param {ImageData} image The image to rotate.  
    * @param {number} angle The angle (radians) to clockwise rotation about the centre of the image.  
    * @return {ImageData} A new rotate image based on the original image and the angle.
    * @throws {InvalidArgumentException} When the parameter image is not an ImageData or angle is not a positive number.
    */
    rotate(image, angle) {
        let matrix = this.createSquareImageMatrix(image);
        let [newMatrix, hi, wi] = this.scaleMatrix(matrix, angle);
        let rotatedMatrix = this.rotateMatrix(newMatrix, hi, wi, angle);
        let antialisingMatrix = this.antialising(rotatedMatrix);

        const newimageData = {
            width: antialisingMatrix.length,
            height: antialisingMatrix[0].length,
            data: []
        };

        let dataArray = this.toArray(antialisingMatrix);
        for (let i = 0; i < dataArray.length; i++) {
            newimageData.data[i] = dataArray[i];
        }

        return newimageData;
    }

    degreesToRadian(angle) {
        return angle * (Math.PI / 180);
    }

    scaleMatrix(matrix, angle) {
        let height = matrix.length;
        let width = matrix[0].length;
        let [h, w] = this.getImageSize({ width: width, height: height }, angle);
        let hi = parseInt((h - height) / 2);
        let wi = parseInt((w - width) / 2);
        let newMatrix = Array(h).fill({ r: 0, g: 0, b: 0, a: 0 }).map(() => Array(w).fill({ r: 0, g: 0, b: 0, a: 0 }));
        for (let i = hi; i < height + hi; i++) {
            for (let j = wi; j < width + wi; j++) {
                newMatrix[i][j] = matrix[i - hi][j - wi];
            }
        }
        return [newMatrix, hi, wi];
    }

    createSquareImageMatrix(image) {
        var data = image.data;
        let height;
        let width;
        let originalHeight = height = image.height;
        let originalWidth = width = image.width;

        if (height > width) {
            width = height;
        } else {
            height = width;
        }
        let matrix = Array(height).fill().map(() => Array(width).fill());
        let index = 0;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (i > originalHeight || j > originalWidth) {
                    matrix[i][j] = { r: 0, g: 0, b: 0, a: 0 };
                }
                else {
                    let pixel = {
                        r: data[index],
                        g: data[index + 1],
                        b: data[index + 2],
                        a: data[index + 3]
                    };
                    index += 4;
                    matrix[i][j] = pixel;
                }
            }
        }
        return matrix;
    }


    getImageSize(image, angle) {
        while (angle > 1.5708) {
            angle -= 1.5708;
        }
        let width = image.width;
        let height = image.height;
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let newHeight, newWidth;
        newWidth = (width * cos) + (height * sin);
        newHeight = (width * sin) + (height * cos);


        return [Math.round(Math.abs(newHeight)), Math.round(Math.abs(newWidth))];
    }

    antialising(matrix) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                let pixel = matrix[i][j];
                if (!pixel || pixel.a == 0) {
                    pixel = this.antialisingPixel(matrix, i, j);
                }
                matrix[i][j] = pixel;
            }
        }
        return matrix;
    }


    rotateMatrix(matrix, hi, wi, angle) {
        let height = matrix.length;
        let width = matrix[0].length;

        let newMatrix = Array(height + 1).fill().map(() => Array(width + 1).fill());
        let centerI = parseInt(height / 2);
        let centerJ = parseInt(width / 2);

        for (let i = 0; i < height - hi; i++) {
            for (let j = 0; j < width - wi; j++) {
                let [newi, newj] = this.rotateIJ(centerI, centerJ, i, j, angle);
                let pixel = matrix[i][j];
                try {
                    newMatrix[newi][newj] = pixel;
                }
                catch{
                }

            }
        }

        return newMatrix;
    }

    antialisingPixel(matrix, i, j) {
        let pixel = matrix[i][j];
        let neighbors = [];

        for (let ni = i - 1; ni <= i + 1; ni++) {
            for (let nj = j - 1; nj <= j + 1; nj++) {
                if (ni < 0 || ni >= matrix.length || nj < 0 || nj >= matrix[0].length || (ni == i && nj == j)) continue;
                if (!matrix[ni][nj] || matrix[ni][nj].a == 0) continue;
                neighbors.push(matrix[ni][nj]);
            }
        }

        if (neighbors.length > 4) {
            let totalR = 0, totalG = 0, totalB = 0;
            for (let neighbor of neighbors) {
                totalR += neighbor.r;
                totalG += neighbor.g;
                totalB += neighbor.b;
            }

            return { r: parseInt(totalR / neighbors.length), g: parseInt(totalG / neighbors.length), b: parseInt(totalB / neighbors.length), a: 255 };
        }

        return pixel;
    }

    rotateIJ(cx, cy, x, y, angle) {
        return this.rotateRadian(cx, cy, x, y, angle);
    }

    rotateRadian(cx, cy, x, y, radians) {
        let cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [Math.abs(Math.round(nx)), Math.abs(Math.round(ny))];
    }

    toArray(matrix) {
        let array = [];
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                var pixel = matrix[i][j];
                if (pixel) {
                    array.push(pixel.r);
                    array.push(pixel.g);
                    array.push(pixel.b);
                    array.push(pixel.a);
                }
                else {
                    array.push(0);
                    array.push(0);
                    array.push(0);
                    array.push(0);
                }
            }
        }

        return array;
    }
}


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Rotator;
else
    window.Rotator = Rotator;