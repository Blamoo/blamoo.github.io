/// <reference path="lib.ts" />

let images = <HTMLSelectElement>document.getElementById("images");
let goDiv = <HTMLDivElement>document.getElementById("goDiv");

let result = <HTMLSpanElement>document.getElementById("result");
let level = <HTMLInputElement>document.getElementById("level");
let go = <HTMLButtonElement>document.getElementById("go");
let imgCopy = <HTMLDivElement>document.getElementById("imgCopy");

let canvas = <HTMLCanvasElement>document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvas2 = <HTMLCanvasElement>document.getElementById("canvas2");
let ctx2 = canvas2.getContext("2d");

let image = new Image();

images.addEventListener('change', function (this:HTMLSelectElement, e) {

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
    canvas2.width = image.width;
    canvas2.height = image.height;

    goDiv.style.display = 'block';
}

go.addEventListener('click', function (e) {
    exec(result, level);
})