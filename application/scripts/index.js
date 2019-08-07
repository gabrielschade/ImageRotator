(function () {
    init();
})();

let image = { height: 0, width: 0 };
let rotator = new Rotator();

function init() {
    document.getElementById('imageLoader').addEventListener('change', handleImage, false);
    document.getElementById('rotateImage').addEventListener('click', rotateImage);
    document.getElementById('angleDegrees').addEventListener('blur', calculateRadians);
    document.getElementById('angle').addEventListener('blur', clearDegrees);
}

function handleImage(e) {
    let canvas = document.getElementById('imageCanvas');
    let context = canvas.getContext('2d');
    let fileReader = new FileReader();
    fileReader.onload = function (event) {
        let newImage = new Image();
        newImage.onload = function () {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0);

            image.height = newImage.height;
            image.width = newImage.width;
        }
        newImage.src = event.target.result;
    }
    fileReader.readAsDataURL(e.target.files[0]);
}

function calculateRadians(){
    let angleDegrees = parseInt(document.getElementById("angleDegrees").value);
    let angle = parseInt(document.getElementById("angle").value);
    let calculated = rotator.degreesToRadian(angleDegrees);
    if(angleDegrees < 0 || calculated == angle) return;

    document.getElementById("angle").value = calculated;
    clearDegrees();
}

function clearDegrees(){
    document.getElementById("angleDegrees").value = '';
}



function rotateImage() {
    document.getElementById('loader').classList.remove('hide');
    let timeOut = setTimeout(function(){
        let canvas = document.getElementById('imageCanvas');
        let context = canvas.getContext('2d');
        let resultCanvas = document.getElementById('resultImageCanvas');
        let resultContext = resultCanvas.getContext('2d');
        let angle = parseFloat(document.getElementById("angle").value);
    
        let currentImage = context.getImageData(0, 0, image.width, image.height);
        let result = rotator.rotate(currentImage, angle);
        const newimageData = resultContext.createImageData(result.width, result.height);
    
        for (let i = 0; i < newimageData.data.length; i++)
            newimageData.data[i] = result.data[i];
    
        resultCanvas.width = newimageData.width;
        resultCanvas.height = newimageData.height;
    
        resultContext.putImageData(newimageData, 0, 0);
        document.getElementById('loader').classList.add('hide');
        clearTimeout(timeOut);
    }, 100);
}


// (async () => {
    //     const rawResponse = await fetch('http://localhost:4000/API/Rotate', {
    //         method: 'POST',
    //         headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({   
    //             image: {height:currentImage.height,width:currentImage.width, data:currentImage.data},
    //             angle: (Math.PI / 180) * rotation
    //         })
    //     });

    //     const content = await rawResponse.json();
    //     const newimageData = ctx.createImageData(content.width,content.height);

    //     for (let i = 0; i < newimageData.data.length; i++) {
    //         newimageData.data[i] = content.data[i];
    //     }
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     canvas.width = newimageData.width;
    //     canvas.height = newimageData.height;
    //     image.height = newimageData.height;
    //     image.width = newimageData.width;
    //     ctx.putImageData(newimageData, 0, 0);
        
    //     })();