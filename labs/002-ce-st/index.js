/// <reference path="lib.ts" />
var images = document.getElementById("images");
var goDiv = document.getElementById("goDiv");
var result = document.getElementById("result");
var level = document.getElementById("level");
var go = document.getElementById("go");
var imgCopy = document.getElementById("imgCopy");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext("2d");
var image = new Image();
images.addEventListener('change', function (e) {
    goDiv.style.display = 'none';
    result.innerHTML = '';
    image.src = this.value;
    //this.
});
image.addEventListener('load', function (e) {
    imageLoaded();
});
function imageLoaded() {
    loadAndFill(BLOCK_SIZE, canvas, ctx, image);
    canvas2.width = canvas.width;
    canvas2.height = canvas.height;
    goDiv.style.display = 'block';
}
go.addEventListener('click', function (e) {
    exec(result, level);
});
