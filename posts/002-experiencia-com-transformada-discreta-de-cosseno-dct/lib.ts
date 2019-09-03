//result.innerHTML = `<a download="download.data" href="data:binary/octet-stream;base64,${btoa(String.fromCharCode.apply(null, i.data))}">meta o pao</a>`;
const BLOCK_SIZE = 8;

function exec(output: HTMLSpanElement, level: HTMLInputElement) {
    let start = performance.now();

    var i = ctx.getImageData(0, 0, canvas.width, canvas.height);

    getBlocks(BLOCK_SIZE, canvas, ctx, function (id, bs, x, y) {
        let c = RawChannels.fromImageData(id);

        let d = DctConvert.RawToDct(c);

        d.quantize(parseInt(level.value));

        let e = DctConvert.DctToRaw(d);
        e.putData(ctx2, bs, x, y);
    });


    let end = performance.now();
    output.innerHTML = `Executado em ${Math.floor(end - start)}ms`;
}

/**Carrega uma imagem e estica os últimos pixels das bordas para que ela seja divisível por bs */
function loadAndFill(bs: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
    canvas.width = Math.ceil(image.width / bs) * bs;
    canvas.height = Math.ceil(image.height / bs) * bs;

    ctx.drawImage(image, 0, 0);

    if (image.width !== canvas.width) {
        ctx.drawImage(canvas, image.width - 1, 0, 1, image.height, image.width, 0, canvas.width - image.width, image.height);
    }

    if (image.height !== canvas.height) {
        ctx.drawImage(canvas, 0, image.height - 1, canvas.width, 1, 0, image.height, canvas.width, canvas.height - image.height);
    }
}

function getBlocks(bs: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callback: (id: ImageData, bs: number, x: number, y: number) => void) {
    let bwidth = canvas.width / bs;
    let bheigh = canvas.height / bs;

    for (var x = 0; x < bwidth; x++) {
        for (var y = 0; y < bheigh; y++) {
            callback(ctx.getImageData(x * bs, y * bs, bs, bs), bs, x, y);
        }
    }
}

class RawChannels {
    r: Uint8ClampedArray;
    g: Uint8ClampedArray;
    b: Uint8ClampedArray;
    a: Uint8ClampedArray;

    readonly length: number;

    public constructor(length: number) {
        this.length = length;
        this.r = new Uint8ClampedArray(length);
        this.g = new Uint8ClampedArray(length);
        this.b = new Uint8ClampedArray(length);
        this.a = new Uint8ClampedArray(length);
    }

    static fromImageData(id: ImageData): RawChannels {
        if (id.data.length % 4 !== 0) {
            throw "Tamanho do array inválido";
        }

        let ret = new RawChannels(id.data.length / 4);

        for (var i = 0; i < ret.length; i++) {
            var z = i * 4;

            ret.r[i] = id.data[z];
            ret.g[i] = id.data[z + 1];
            ret.b[i] = id.data[z + 2];
            ret.a[i] = id.data[z + 3];
        }
        return ret;
    }

    putData(c: CanvasRenderingContext2D, bs: number, x: number, y: number) {
        let id = c.getImageData(x * bs, y * bs, bs, bs);

        let z = id.data.length / 4;

        for (var i = 0; i < z; i++) {
            let zs = i * 4;

            id.data[zs] = this.r[i];
            id.data[zs + 1] = this.g[i];
            id.data[zs + 2] = this.b[i];
            id.data[zs + 3] = this.a[i];
        }

        c.putImageData(id, x * bs, y * bs);
    }
}

class DctChannels {
    r: Float32Array;
    g: Float32Array;
    b: Float32Array;
    a: Float32Array;

    readonly length: number;

    public constructor(length: number) {
        this.length = length;
        this.r = new Float32Array(length);
        this.g = new Float32Array(length);
        this.b = new Float32Array(length);
        this.a = new Float32Array(length);
    }

    quantize(shift: number) {
        DctChannels.quantizeChannel(this.r, shift);
        DctChannels.quantizeChannel(this.g, shift);
        DctChannels.quantizeChannel(this.b, shift);
        DctChannels.quantizeChannel(this.a, shift);
    }

    static quantizeChannel(X: Float32Array, s: number) {
        let sx = 1 << s;

        for (var i = 0; i < X.length; i++) {
            X[i] = Math.round(X[i] / sx) * sx;
        }
    }


    static dct(x: Float32Array): Float32Array {
        let s = x.length;
        let xk = new Array<Float32Array>(s);
        let X = new Float32Array(s);

        xk[0] = new Float32Array(s);

        for (var n = 0; n < s; ++n) {
            xk[0][n] = 1 / Math.sqrt(s) * x[n];
        }

        for (var k = 1; k < s; ++k) {
            xk[k] = new Float32Array(s);
            for (var n = 0; n < s; ++n) {
                xk[k][n] = Math.sqrt(2 / s) *
                    Math.cos(k * Math.PI / (2 * s) * (2 * n + 1)) *
                    x[n];
            }
        }

        for (var k = 0; k < s; ++k) {
            X[k] = 0;
        }

        for (var k = 0; k < s; ++k) {
            for (var n = 0; n < s; ++n) {
                X[k] += xk[k][n];
            }
        }

        return X;
    }

    static idct(X: Float32Array): Float32Array {
        let s = X.length;
        let xk = new Array<Float32Array>(s);
        let x = new Float32Array(s);

        xk[0] = new Float32Array(s);

        for (var n = 0; n < s; ++n) {
            xk[0][n] = Math.sqrt(1 / s) * X[0] * Math.cos(0);
        }

        for (var k = 1; k < s; ++k) {
            xk[k] = new Float32Array(s);
            for (var n = 0; n < s; ++n) {
                xk[k][n] = Math.sqrt(2 / s) *
                    X[k] *
                    Math.cos(k * (2 * n + 1) * Math.PI / (2 * s));
            }
        }

        for (var k = 0; k < s; ++k) {
            X[k] = 0;
        }

        for (var k = 0; k < s; ++k) {
            for (var n = 0; n < s; ++n) {
                x[k] += xk[n][k];
            }
        }

        return x;
    }
}

class DctConvert {
    static RawToDct(input: RawChannels): DctChannels {
        let ret = new DctChannels(input.length);

        ret.r = DctChannels.dct(input.r);
        ret.g = DctChannels.dct(input.g);
        ret.b = DctChannels.dct(input.b);
        ret.a = DctChannels.dct(input.a);

        return ret;
    }

    static DctToRaw(input: DctChannels): RawChannels {
        let ret = new RawChannels(input.length);

        ret.r = DctChannels.idct(input.r);
        ret.g = DctChannels.idct(input.g);
        ret.b = DctChannels.idct(input.b);
        ret.a = DctChannels.idct(input.a);

        return ret;
    }
}