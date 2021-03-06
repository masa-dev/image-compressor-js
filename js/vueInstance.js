const fileInfo = new Vue({
    el: '#file-information',
    data: {
        seen: true,
        fileList: []
    },
    methods: {
        addFile: function (originFiles) {
            // 必要な情報を持ったコピー配列を作成する
            let files = [];
            for (let item of originFiles) {
                files.push({
                    name: item.name,
                    size: item.size,
                    nameForSort: item.name//numberReplacer(item.name)
                });
            }


            // 名前を昇順でソート
            files.sort(function (a, b) {
                if (a.nameForSort > b.nameForSort) {
                    return 1;
                } else {
                    return -1;
                }
            });


            // データの追加
            for (let i = 0; i < files.length; i++) {
                let size = calculateSize(files[i].size);
                this.fileList.push({
                    id: i,
                    name: files[i].name,
                    size: size,
                    compressedSize: '-',
                    status: 'processing'
                });
            }

            // 数字が桁違いでもソートできるように0を追加する関数
            function numberReplacer(match) {
                let num = match;
                const numLength = String(match).length;
                for (let i = 0; i < 20 - numLength; i++) {
                    num = '0' + num;
                }
                return num;
            }
        },
        deleteFile: function () {
            this.fileList.splice(0, this.fileList.length);
        },
        dropFile: function (files) {
            this.deleteFile();
            this.addFile(files);
            this.resetProgressBar(files.length);
        },
        resetProgressBar: function (length) {
            for (let i = 0; i < length; i++) {
                $('#progress_' + i).removeClass('bg-danger bg-success');
                $('#progress_' + i).addClass('bg-info progress-bar-striped');
                $('#progress_' + i).html('Processing');
            }
        }
    },
    watch: {
        seen: function () {
            if (this.seen === true) {
                // 時間をおいて更新する（0.3s）
                setTimeout(function () {
                    for (let i = 0; i < fileInfo.fileList.length; i++) {
                        if (fileInfo.fileList[i].status == 'success') {
                            $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                            $('#progress_' + i).addClass('bg-success');
                            $('#progress_' + i).html('Finished');
                        }
                        else if (fileInfo.fileList[i].status == 'file error') {
                            $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                            $('#progress_' + i).addClass('bg-danger');
                            $('#progress_' + i).html('Failure');
                        }
                        else if (fileInfo.fileList[i].status == 'Different file') {
                            $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                            $('#progress_' + i).addClass('bg-danger');
                            $('#progress_' + i).html('Refused');
                        }
                    }
                }, 300);
            }
        }
    }
});

const resultOfCompression = new Vue({
    el: '#result',
    data: {
        seen: false,
        totalSize: {
            origin: 0,
            compressed: 0,
            difference: 0,
            renamed: '0KB'
        },
        differencePercent: 0,
        quantity: {
            total: 0,
            finished: 0
        }
    },
    methods: {
        resetQuantity: function (totalQuantity) {
            this.quantity.total = totalQuantity;
            this.quantity.finished = 0;
        },
        updateQuantity: function () {
            this.quantity.finished++;
        },
        increaseValue: function (originSize, compressedSize) {
            this.totalSize.origin += originSize;
            this.totalSize.compressed += compressedSize;
            this.totalSize.difference += originSize - compressedSize;

            this.totalSize.renamed = calculateSize(this.totalSize.difference);
            this.calculatePercentage();
        },
        calculatePercentage: function () {
            this.differencePercent = Math.floor((this.totalSize.difference / this.totalSize.origin) * 100 * 10) / 10;
        },
        resetValue: function () {
            this.totalSize.origin = 0;
            this.totalSize.compressed = 0;
            this.totalSize.difference = 0;
            this.totalSize.renamed = '0KB';
            this.differencePercent = 0;
        }
    }
});

const informationEntry = new Vue({
    el: '#information-entry-area',
    data: {
        parameters: {
            quality: 0.8,
            maxWidth: Infinity,
            maxHeight: Infinity
        }
    },
    methods: {
        setParameters: function () {
            this.parameters = {
                quality: config.imageQuality,
                maxWidth: config.maxWidth,
                maxHeight: config.maxHeight
            }
        }
    }
});

const sideContent = new Vue({
    el: '#side-content',
    data: {
        execution: true,
        imgSrc: {
            original: 'images/sample/default_image.jpg',
            compressed: 'images/sample/default_image.jpg'
        },
        parameters: {
            displayScale: 1.0,
            quality: 0.8,
            maxWidth: Infinity,
            maxHeight: Infinity
        },
        image: {
            processing: false,
            aborted: false,
            default: null,
            compressor: null,    // Compressor.jsのオブジェクトが入る
            resultSize: {
                original: null,
                compressed: null,
                originalStr: '',
                compressedStr: '',
                compressionRatio: 0,
                seen: true
            }
        },
        dropped: {
            index: 0,
            length: 0,
            indexToDisplay: 0   // 表示用のインデックス
        }
    },
    methods: {
        nextImage: function () {
            if (this.dropped.index < this.dropped.length - 1) {
                this.dropped.index++;
                this.dropped.indexToDisplay++;
                this.executeCompressImage();
            }
        },
        preImage: function () {
            if (this.dropped.index > 0) {
                this.dropped.index--;
                this.dropped.indexToDisplay--;
                this.executeCompressImage();
            }
        },
        setNewImage: function (file, compressed) {
            let filereader = new FileReader();
            filereader.onload = function (e) {
                if (compressed === true) {
                    sideContent.imgSrc.compressed = filereader.result;
                }
                else if (compressed === false) {
                    sideContent.imgSrc.original = filereader.result;
                }
            };

            if (file) {
                filereader.readAsDataURL(file);
            }
        },
        reflectDisplayScale: function () {
            this.setParameters();

            const scale = this.parameters.displayScale;
            let originalImageElement = document.getElementById('original-sample-image');
            let compressedImageElement = document.getElementById('compressed-sample-image');

            originalImageElement.style.transform = `scale(${scale},${scale})`;
            compressedImageElement.style.transform = `scale(${scale},${scale})`;
        },
        setParameters: function () {
            let displayScale = document.getElementById('display-scale').value;
            let quality = config.imageQuality;
            let maxWidth = config.maxWidth;
            let maxHeight = config.maxHeight;

            // 左辺がfalsyである場合にInfinityにする
            maxWidth ||= Infinity;
            maxHeight ||= Infinity;

            this.parameters.displayScale = parseFloat(displayScale);
            this.parameters.quality = parseFloat(quality);
            this.parameters.maxWidth = parseFloat(maxWidth);
            this.parameters.maxHeight = parseFloat(maxHeight);
        },
        setDroppedParameters: function () {
            this.dropped.length = droppedFiles.length;
            this.dropped.index = 0;

            // 条件演算子
            // DroppedFiles[0]が存在する場合，1（単位：ページ）を入れる
            // DroppedFiles[0]が存在しない場合，0（0ページ中0ページ目）を入れる
            this.dropped.indexToDisplay = droppedFiles[0] ? 1 : 0;
        },
        executeCompressImage: function (isError = false) {
            // mainContent の内容を更新する
            informationEntry.setParameters();

            // execution が false の場合は処理を実行しない
            if (!this.execution) {
                return;
            }

            let file;
            this.setParameters();

            // ファイルが存在しない，又はエラーが発生している場合
            if (!droppedFiles[0] || isError) {
                file = this.image.default;
            }
            else {
                file = droppedFiles[this.dropped.index];
            }

            
            this.image.resultSize.original = file.size;
            this.image.resultSize.originalStr = calculateSize(file.size);

            if (this.image.compressor !== null) {
                this.image.compressor = null;
            }

            this.image.processing = true;
            this.setNewImage(file, false);

            this.image.compressor = new Compressor(file, {
                maxWidth: sideContent.parameters.maxWidth,
                maxHeight: sideContent.parameters.maxHeight,
                quality: sideContent.parameters.quality,
                mimeType: 'image/jpeg',
                convertSize: Infinity,

                success(result) {
                    // 成功時の処理
                    sideContent.image.resultSize.compressed = result.size;
                    sideContent.image.resultSize.compressedStr = calculateSize(result.size);
                    sideContent.calculatePercentage();
                    sideContent.changeResultColor();
                    sideContent.setNewImage(result, true);
                    sideContent.image.processing = false;
                },
                error(err) {
                    // 失敗時の処理
                    // 失敗時はデフォルトの画像を使用する．
                    sideContent.executeCompressImage(true);
                }
            });
        },
        changeResultColor() {
            const idList = [
                'compressed-sample-size',
                'sample-compression-ratio'
            ]

            for (let id of idList) {
                const element = document.getElementById(id);

                if (this.image.resultSize.compressed == this.image.resultSize.original) {
                    // サイズが変わっていない時
                    element.classList.remove('red');
                    element.classList.remove('green');
                }
                else if (this.image.resultSize.compressed < this.image.resultSize.original) {
                    // 圧縮後の方がサイズが小さいときにgreenクラスを付与
                    element.classList.remove('red');
                    element.classList.add('green');
                }
                else {
                    // 圧縮後の方がサイズが大きいときにredクラスを付与
                    element.classList.remove('green');
                    element.classList.add('red');
                }
            }
        },
        calculatePercentage: function () {
            this.image.resultSize.compressionRatio =
                (Math.floor((1 - this.image.resultSize.compressed / this.image.resultSize.original) * 100 * 10) / 10) + '%';
        }
    }
});


window.addEventListener('load', function () {
    // サーバー上にある画像をBlob形式で取得
    fetch("https://masa-dev.github.io/image-compressor-js/images/sample/default_image.jpg")
        .then(function (response) {
            return response.blob();
        })
        .then(function (blob) {
            // here the image is a blob
            sideContent.image.default = blob;
            sideContent.executeCompressImage();
        });

    // サイドバーを非表示の場合（幅が900px以下）は処理を実行しない
    if (document.body.clientWidth < 900) {
        sideContent.execution = false;
    }
})
