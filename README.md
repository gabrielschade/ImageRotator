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
| ![Original](https://i.imgur.com/CT2niXK.jpg)  |  ![After](https://imgur.com/euhYfQ1.jpg)  |

## Scale the matrix

Scale the matrix according the rotation's angle

## Rotate the matrix

Rotate the matrix around its central point;

## Antialiasing the matrix

 Antialiasing the matrix to enhance the result
## Create a new ImageData
