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
        let currentImage = null;
        try {
            currentImage = context.getImageData(0, 0, image.width, image.height);
            let result = currentImage;
            result = rotator.rotate(currentImage, angle);

            const newimageData = resultContext.createImageData(result.width, result.height);

            for (let i = 0; i < newimageData.data.length; i++)
                newimageData.data[i] = result.data[i];

            resultCanvas.width = newimageData.width;
            resultCanvas.height = newimageData.height;

            resultContext.putImageData(newimageData, 0, 0);
        } catch{
            M.toast({ html: 'Oops, something went wrong. Please check your inputs.' });
            document.getElementById('loader').classList.add('hide');
            clearTimeout(timeOut);
        }

        document.getElementById('loader').classList.add('hide');
        clearTimeout(timeOut);
    }, 100);
    
}
