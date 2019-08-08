# ImageRotator

This repository contains a JavaScript code capable of rotate an given image [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData).

## Summary

The algorithm to rate an [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) is implemented in the [Rotator](https://github.com/gabrielschade/ImageRotator/blob/master/domain/Rotator.js) class and it is composed of five different steps:

1. [Create a Pixel matrix](#-create-a-pixel-matrix);
2. [Scale the matrix](#-scale-the-matrix);
3. [Rotate the matrix](#-rotate-the-matrix);
4. [Antialiasing the matrix](#-antialiasing-the-matrix);
5. [Create a new ImageData](#-create-a-new-imagedata).


## Create a Pixel Matrix

The first step is converting the original [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) to an matrix of [`Pixel`](https://github.com/gabrielschade/ImageRotator/blob/master/domain/Rotator.js).

This step also ensures that the resulting matrix is an square matrix, in order to avoid problems of resizing the image.

| Before  | After |
|---|---|
| ![Before](https://i.imgur.com/CT2niXK.jpg)  |  ![After](https://imgur.com/euhYfQ1.jpg)  |

For square images, the result will be the same as the input:

| Before  | After |
|---|---|
| ![Before](https://i.imgur.com/Ods69b0.jpg)  |  ![After](https://imgur.com/Ods69b0.jpg)  |

## Scale the matrix

This step is responsible of scale the [`Pixel`](https://github.com/gabrielschade/ImageRotator/blob/master/domain/Rotator.js)'s matrix according the rotation angle.

The algorithm uses the triangle properties with cos(θ) and sin(θ), like the image below:

![Scale](https://imgur.com/DsduFDf.png)

```javascript
let cos = Math.cos(angle);
let sin = Math.sin(angle);
let newHeight, newWidth;

newWidth = (width * cos) + (height * sin);
newHeight = (width * sin) + (height * cos);
```

> It is important to notice that, the rotation itself is not calculated yet. The picture shown above is just an illustration to help in the problem understanding.

After this step the [Pixel](https://github.com/gabrielschade/ImageRotator/blob/master/domain/Rotator.js)'s matrix scale to the right size.

| Before  | After (30 degrees) |
|---|---|
| ![Original](https://imgur.com/euhYfQ1.jpg)  |  ![After](https://imgur.com/5ScZOjc.jpg)  |

| Before  | After (30 degrees)|
|---|---|
| ![Original](https://imgur.com/Ods69b0.jpg)  |  ![After](https://imgur.com/NwvjfTL.png)  |


## Rotate the matrix

Rotate the matrix around its central point is the main algorithm of this class. It works following the concept of a [rotation matrix](https://en.wikipedia.org/wiki/Rotation_matrix).

This algorithm transverse all image's matrix, calculating the new X,Y position for each [Pixel](https://github.com/gabrielschade/ImageRotator/blob/master/domain/Rotator.js).

The center of the image is defined as 0,0 position, then, the new position is calculated based on the rotation matrix:

![Image](https://imgur.com/jWGoNA8.png)

```javascript
let cos = Math.cos(radians),
    sin = Math.sin(radians),
    newX = (cos * (row - centralRow)) + (sin * (column - centralColumn)) + centralRow,
    newY = (cos * (column - centralColumn)) - (sin * (row - centralRow)) + centralColumn;
return [this.normalizeNumber(newX), this.normalizeNumber(newY)];
```

| Before  | After (30 degrees) |
|---|---|
| ![Original](https://imgur.com/5ScZOjc.jpg)  |  ![After](https://imgur.com/mAuGQeb.jpg)  |

| Before  | After (30 degrees)|
|---|---|
| ![Original](https://imgur.com/NwvjfTL.jpg)  |  ![After](https://imgur.com/PDf0Yy2.png)  |

Since there is a rounding (`normalizeNumber` uses Math.round), some positions in the matrix are not filled. 
it can prejudice the final result.

## Antialiasing the matrix

As above mentioned the previous step can create some "holes" in the image. 

In order to enhance the result, the antialiasing algorithm is responsbile to transverse the image's matrix and calculates the average of the neighbors pixels RGBA for each transparent pixel that contains at least four valid neighbors.

> A invalid neighbor is defined as: A pixel transparent, out of the matrix bounds or `undefined`.

The image below shows the algorithm calculating a single pixel:

![Calculated Antialiasing](https://imgur.com/83UhrMQ.png)

```javascript
static antialiasing(matrix, row, column) {
    if (Pixel.isOutOfBounds(matrix,row, column)) throw new RangeError();

    let pixel = matrix[row][column];
    let neighbors = Pixel.getNeighbors(matrix,row,column);

    if (neighbors.length > 3) {
        pixel = Pixel.getAverageRGB(neighbors);
    }

    return pixel;
    }
```
| Before  | After (30 degrees) |
|---|---|
| ![Original](https://imgur.com/mAuGQeb.jpg)  |  ![After](https://imgur.com/ze8Rxct.jpg)  |

| Before  | After (30 degrees)|
|---|---|
| ![Original](https://imgur.com/PDf0Yy2.png)  |  ![After](https://imgur.com/S74ALbu.png)  |

## Create a new ImageData

This process simply transverse the whole image matrix and create a new object.

```javascript
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
```

In order to be able to run it at NodeJS, I didn't use the actual ImageData type, since it is part of the Canvas API.