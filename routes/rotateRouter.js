const express = require('express');
const Rotator = require('../domain/Rotator');

function createRotateRouter(){
    const rotateRouter = express.Router();

    rotateRouter.post('/Rotate', (request, response) => {
        let params = request.body; 
        let rotator = new Rotator();
        let result = rotator.rotate(params.image, params.angle);
         
        response.json(result);
    });

    return rotateRouter;
}

module.exports = createRotateRouter;