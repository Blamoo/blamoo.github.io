var target = document.getElementById("target");
var canvas = document.getElementById("canvas");
var result = document.getElementById("result");
var ctx = canvas.getContext("2d");
var go = document.getElementById("go");
go.addEventListener('click', function (e) {
    exec();
});
/**
 * Retorna um valor entre n1 e n2 conforme amount (de -1 a 1)
 */
function map(amount, n1, n2) {
    return n1 + (n2 - n1) * (amount / 2 + 0.5);
}
/**
 * Retorna uma cor entre c1 e c2 conforme amount (de -1 a 1)
 */
function mapColor(amount, c1, c2) {
    var ret = new Uint8ClampedArray(3);
    ret[0] = map(amount, c1[0], c2[0]);
    ret[1] = map(amount, c1[1], c2[1]);
    ret[2] = map(amount, c1[2], c2[2]);
    return ret;
}
/**
 * Retorna um array com 3 bytes aleatórios
 */
function randomColor() {
    var ret = new Uint8ClampedArray(3);
    // 24bpp
    //ret[0] = Math.random() * 256;
    //ret[1] = Math.random() * 256;
    //ret[2] = Math.random() * 256;
    // 3bpp
    ret[0] = Math.floor(Math.random() * 2) * 256;
    ret[1] = Math.floor(Math.random() * 2) * 256;
    ret[2] = Math.floor(Math.random() * 2) * 256;
    return ret;
}
/**
 * Altera a cor de um pixel em um imagedata
 */
function setPixel(id, x, y, r, g, b) {
    var offset = (x + y * id.width) * 4;
    id.data.set(new Uint8ClampedArray([r, g, b, 255]), offset);
}
/**
 * Executa a coisa toda
 */
function exec() {
    var start = performance.now();
    // Tamanho dos blocos
    var bs = 8;
    // Altura e largura da imagem (em blocos)
    var bwidth = 80;
    var bheight = 60;
    // Criando canvas, imagedata e adicionando no documento
    canvas.width = bs * bwidth;
    canvas.height = bs * bheight;
    var id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // iterando pelos blocos
    for (var by = 0; by < bheight; by++) {
        for (var bx = 0; bx < bwidth; bx++) {
            // Cores aleatórias para o bloco
            var rc1 = randomColor();
            var rc2 = randomColor();
            // Número de divisões no bloco (de 0 a bs)
            var nx = Math.floor(Math.random() * 9);
            var ny = Math.floor(Math.random() * 9);
            // iterando pelos pixels do bloco
            for (var cy = 0; cy < bs; cy++) {
                for (var cx = 0; cx < bs; cx++) {
                    // Posição na imagem
                    var x = bs * bx + cx;
                    var y = bs * by + cy;
                    // parâmetro para Math.cos
                    var fx = (cx / bs) * Math.PI * nx;
                    var fy = (cy / bs) * Math.PI * ny;
                    var rca = mapColor(Math.cos(fx) * Math.cos(fy), rc1, rc2);
                    setPixel(id, x, y, rca[0], rca[1], rca[2]);
                }
            }
        }
    }
    ctx.putImageData(id, 0, 0);
    var end = performance.now();
    result.innerHTML = Math.floor(end - start) + "ms";
}
