let target = document.getElementById("target");
let canvas = <HTMLCanvasElement>document.getElementById("canvas");
let result = document.getElementById("result");
let ctx = canvas.getContext("2d");
let go = document.getElementById("go");

go.addEventListener('click', function (e) {
    exec();
});

/**
 * Retorna um valor entre n1 e n2 conforme amount (de -1 a 1)
 */
function map(amount: number, n1: number, n2: number) {
    return n1 + (n2 - n1) * (amount / 2 + 0.5);
}

/**
 * Retorna uma cor entre c1 e c2 conforme amount (de -1 a 1)
 */
function mapColor(amount: number, c1: Uint8ClampedArray, c2: Uint8ClampedArray): Uint8ClampedArray {
    let ret = new Uint8ClampedArray(3);
    ret[0] = map(amount, c1[0], c2[0]);
    ret[1] = map(amount, c1[1], c2[1]);
    ret[2] = map(amount, c1[2], c2[2]);
    return ret;
}

/**
 * Retorna um array com 3 bytes aleatórios
 */
function randomColor(): Uint8ClampedArray {
    let ret = new Uint8ClampedArray(3);

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
function setPixel(id: ImageData, x: number, y: number, r: number, g: number, b: number): void {
    let offset = (x + y * id.width) * 4;

    id.data.set(new Uint8ClampedArray([r, g, b, 255]), offset);
}

/**
 * Executa a coisa toda
 */
function exec() {
    let start = performance.now();

    // Tamanho dos blocos
    const bs = 8;

    // Altura e largura da imagem (em blocos)
    const bwidth = 80;
    const bheight = 60;

    // Criando canvas, imagedata e adicionando no documento
    canvas.width = bs * bwidth;
    canvas.height = bs * bheight;
    let id = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // iterando pelos blocos
    for (let by = 0; by < bheight; by++) {
        for (let bx = 0; bx < bwidth; bx++) {
            // Cores aleatórias para o bloco
            let rc1 = randomColor();
            let rc2 = randomColor();

            // Número de divisões no bloco (de 0 a bs)
            let nx = Math.floor(Math.random() * 9);
            let ny = Math.floor(Math.random() * 9);

            // iterando pelos pixels do bloco
            for (let cy = 0; cy < bs; cy++) {
                for (let cx = 0; cx < bs; cx++) {
                    // Posição na imagem
                    let x = bs * bx + cx;
                    let y = bs * by + cy;

                    // parâmetro para Math.cos
                    let fx = (cx / bs) * Math.PI * nx;
                    let fy = (cy / bs) * Math.PI * ny;

                    let rca = mapColor(Math.cos(fx) * Math.cos(fy), rc1, rc2);

                    setPixel(id, x, y, rca[0], rca[1], rca[2]);
                }
            }
        }
    }

    ctx.putImageData(id, 0, 0);

    let end = performance.now();
    result.innerHTML = `imagem gerada em ${Math.floor(end - start)}ms`;

}
