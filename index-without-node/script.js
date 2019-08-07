var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');
var ctx = canvas.getContext('2d');
var rotate = document.getElementById('rotateImage');
    rotate.addEventListener('click', rotateImage);

var image = {
    width:0,
    height:0,
    originalHeight:0,
    originalWidth:0
}
function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);

            image.height = img.height;
            image.width = img.width;
            image.originalHeight = img.height;
            image.originalWidth = img.width;
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
}

function rotateImage(){
    let rotation = parseInt(document.getElementById("rotate").value);
    let currentImage = ctx.getImageData(0, 0, image.width, image.height);
    
    let rotator = new Rotator();
    let result = rotator.rotate(currentImage, rotation *  (Math.PI / 180));
    const newimageData = ctx.createImageData(result.width, result.height);
    
    for(let i=0;i<newimageData.data.length;i++)
        newimageData.data[i] = result.data[i];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = newimageData.width;
    canvas.height = newimageData.height;
    image.height = newimageData.height;
    image.width = newimageData.width;
    ctx.putImageData(newimageData, 0, 0);
}
