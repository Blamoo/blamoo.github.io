//result.innerHTML = `<a download="download.data" href="data:binary/octet-stream;base64,${btoa(String.fromCharCode.apply(null, i.data))}">meta o pao</a>`;
var BLOCK_SIZE = 8;
function exec(output, level) {
    var start = performance.now();
    var i = ctx.getImageData(0, 0, canvas.width, canvas.height);
    getBlocks(BLOCK_SIZE, canvas, ctx, function (id, bs, x, y) {
        var c = RawChannels.fromImageData(id);
        var d = DctConvert.RawToDct(c);
        d.quantize(parseInt(level.value));
        var e = DctConvert.DctToRaw(d);
        e.putData(ctx2, bs, x, y);
    });
    var end = performance.now();
    output.innerHTML = "Executado em " + Math.floor(end - start) + "ms";
}
/**Carrega uma imagem e estica os últimos pixels das bordas para que ela seja divisível por bs */
function loadAndFill(bs, canvas, ctx, image) {
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
function getBlocks(bs, canvas, ctx, callback) {
    var bwidth = canvas.width / bs;
    var bheigh = canvas.height / bs;
    for (var x = 0; x < bwidth; x++) {
        for (var y = 0; y < bheigh; y++) {
            callback(ctx.getImageData(x * bs, y * bs, bs, bs), bs, x, y);
        }
    }
}
var RawChannels = (function () {
    function RawChannels(length) {
        this.length = length;
        this.r = new Uint8ClampedArray(length);
        this.g = new Uint8ClampedArray(length);
        this.b = new Uint8ClampedArray(length);
        this.a = new Uint8ClampedArray(length);
    }
    RawChannels.fromImageData = function (id) {
        if (id.data.length % 4 !== 0) {
            throw "Tamanho do array inválido";
        }
        var ret = new RawChannels(id.data.length / 4);
        for (var i = 0; i < ret.length; i++) {
            var z = i * 4;
            ret.r[i] = id.data[z];
            ret.g[i] = id.data[z + 1];
            ret.b[i] = id.data[z + 2];
            ret.a[i] = id.data[z + 3];
        }
        return ret;
    };
    RawChannels.prototype.putData = function (c, bs, x, y) {
        var id = c.getImageData(x * bs, y * bs, bs, bs);
        var z = id.data.length / 4;
        for (var i = 0; i < z; i++) {
            var zs = i * 4;
            id.data[zs] = this.r[i];
            id.data[zs + 1] = this.g[i];
            id.data[zs + 2] = this.b[i];
            id.data[zs + 3] = this.a[i];
        }
        c.putImageData(id, x * bs, y * bs);
    };
    return RawChannels;
}());
var DctChannels = (function () {
    function DctChannels(length) {
        this.length = length;
        this.r = new Float32Array(length);
        this.g = new Float32Array(length);
        this.b = new Float32Array(length);
        this.a = new Float32Array(length);
    }
    DctChannels.prototype.quantize = function (shift) {
        DctChannels.quantizeChannel(this.r, shift);
        DctChannels.quantizeChannel(this.g, shift);
        DctChannels.quantizeChannel(this.b, shift);
        DctChannels.quantizeChannel(this.a, shift);
    };
    DctChannels.quantizeChannel = function (X, s) {
        var sx = 1 << s;
        for (var i = 0; i < X.length; i++) {
            X[i] = Math.round(X[i] / sx) * sx;
        }
    };
    DctChannels.dct = function (x) {
        var s = x.length;
        var xk = new Array(s);
        var X = new Float32Array(s);
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
    };
    DctChannels.idct = function (X) {
        var s = X.length;
        var xk = new Array(s);
        var x = new Float32Array(s);
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
    };
    return DctChannels;
}());
var DctConvert = (function () {
    function DctConvert() {
    }
    DctConvert.RawToDct = function (input) {
        var ret = new DctChannels(input.length);
        ret.r = DctChannels.dct(input.r);
        ret.g = DctChannels.dct(input.g);
        ret.b = DctChannels.dct(input.b);
        ret.a = DctChannels.dct(input.a);
        return ret;
    };
    DctConvert.DctToRaw = function (input) {
        var ret = new RawChannels(input.length);
        ret.r = DctChannels.idct(input.r);
        ret.g = DctChannels.idct(input.g);
        ret.b = DctChannels.idct(input.b);
        ret.a = DctChannels.idct(input.a);
        return ret;
    };
    return DctConvert;
}());
