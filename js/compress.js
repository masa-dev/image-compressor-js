let fileArea = document.getElementById('drag-drop-area');
let fileInput = document.getElementById('file-input');
let droppedFiles = [];  //画像ファイルを格納する変数
let compressedFiles = [];
let loadCheck = false;
let processing = false; //処理中であるかどうか

fileArea.addEventListener('dragover', function (evt) {
    if (!processing) {
    evt.preventDefault();
        fileArea.classList.add('dragover');
        fileArea.classList.add('active');
    }
});

fileArea.addEventListener('dragleave', function (evt) {
    if (!processing) {
    evt.preventDefault();
        fileArea.classList.remove('dragover');
        fileArea.classList.remove('active');
    }
});

fileArea.addEventListener('drop', function (evt) {
    if (!processing) {
        evt.preventDefault();
        fileArea.classList.remove('dragenter');
        fileArea.classList.remove('active');
        //このdroppedFilesに画像データが入る
        droppedFiles = evt.dataTransfer.files;
        fileInput.files = droppedFiles;

        fileInfo.dropFile(droppedFiles);

        compressImages(droppedFiles);
    }
});

fileInput.addEventListener('change', function (evt) {
    droppedFiles = evt.target.files;

    fileInfo.dropFile(evt.target.files);

    if (loadCheck == false) {
        compressImages(droppedFiles);
    }
    else {
        for (let i = 0; i < fileInfo.fileList.length; i++) {
            setTimeout(() => {
                $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                $('#progress_' + i).addClass('bg-danger');
                $('#progress_' + i).html('Failure')
                fileInfo[i].fileList.status = 'file error';
            }, 100)
        }
    }
}, false);

//ロード時のchangeイベントの発生を防止
window.onload = function () {
    loadCheck = true;
    setTimeout(() => {
        loadCheck = false;
    }, 500);
};

function compressImages(files) {
    const imageQuality = parseFloat(document.getElementById('quality').value);
    const onlyJpeg = document.getElementById('only-jpeg').checked;
    const convertJpeg = document.getElementById('convert-all-to-jpeg').checked;
    let mimeType;
    let maxWidth, maxHeight;
    let totalCount = 0, count = 0;
    let errorFlag = false;
    compressedFiles.splice(0, compressedFiles.length);


    //すべてJPEG形式に変換するかどうかの判別
    if (convertJpeg) {
        mimeType = 'image/jpeg';
    } else {
        mimeType = 'auto';
    }

    //maxWidth と maxHeight の選択していないときに Infinity にする
    if (document.getElementById('max-width').value == "") {
        maxWidth = Infinity;
    } else {
        maxWidth = parseFloat(document.getElementById('max-width').value);
    }

    if (document.getElementById('max-height').value == "") {
        maxHeight = Infinity;
    } else {
        maxHeight = parseFloat(document.getElementById('max-height').value);
    }

    //console.log('maxWidth: ' + maxWidth + '\nmaxHeight: ' + maxHeight);

    //処理の開始
    processing = true;

    if (files.length != 0) {
        //ボタンを無効にする
        disabledOfInputAndBtn(true);
        //ロード画像を表示する
        displayLoadingAnimation('fastparrot');
    }

    //resultOfCompression を見えるようにする
    resultOfCompression.resetValue();
    if (files.length == 0) {
        resultOfCompression.seen = false;
    }
    else if (resultOfCompression.seen === false) {
        resultOfCompression.seen = true;
    }
    //個数の表示のリセット
    resultOfCompression.resetQuantity(files.length);

    //合計の処理回数
    for (let i = 0; i < files.length; i++) {
        totalCount++;
    }

    //画像の圧縮
    for (let i = 0; i < files.length; i++) {
        //onlyJpeg が true のときは jpeg のみ通す
        if ((convertJpeg == true || onlyJpeg == false) || files[i].type == 'image/jpeg') {
            //非同期
            const img = new Compressor(files[i], {
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                quality: imageQuality,
                mimeType: mimeType,
                convertSize: Infinity,
                success(result) {
                    compressedFiles.push(result)
                    $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                    $('#progress_' + i).addClass('bg-success');
                    $('#progress_' + i).html('Finished')

                    let size = calculateSize(result.size);
                    let difference = Math.floor(((files[i].size - result.size) / files[i].size) * 100 * 10) / 10;

                    //fileInfo とデータを合わせて変更する
                    //拡張子が変わるため処理を分ける
                    if (convertJpeg && files[i].type != 'image/jpeg') {
                        //拡張子を取り除く
                        let fileName = result.name.split('.').slice(0, -1).join('.');
                        for (let j = 0; j < fileInfo.fileList.length; j++) {
                            if (fileInfo.fileList[j].name.indexOf(fileName) != -1) {
                                fileInfo.fileList[j].compressedSize = size + ' (-' + difference + '%)';
                                fileInfo.fileList[j].status = 'success';
                            }
                        }
                    } else {
                        for (let j = 0; j < fileInfo.fileList.length; j++) {
                            if (fileInfo.fileList[j].name == result.name) {
                                fileInfo.fileList[j].compressedSize = size + ' (-' + difference + '%)';
                                fileInfo.fileList[j].status = 'success';
                            }
                        }
                    }

                    //resultOfCompression とデータを合わせて変更する
                    resultOfCompression.increaseValue(files[i].size, result.size);
                    resultOfCompression.updateQuantity();

                    count++;
                    if (count == totalCount) {
                        //処理の終了
                        processing = false;
                        //ボタンを有効にする
                        disabledOfInputAndBtn(false);
                        //ロード画像を消す
                        deleteLoadingAnimation();
                    }
                },
                error(err) {
                    //対応外のプログレスバー更新（Falure）が出来ないため時間をずらす
                    setTimeout(() => {
                        $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                        $('#progress_' + i).addClass('bg-danger');
                        $('#progress_' + i).html('Failure')
                        fileInfo[i].fileList.status = 'file error';
                    }, 100)

                    if (errorFlag === false) {
                        errorFlag = true;

                        alert('エラーが発生しました\n' + err);

                        //処理の終了
                        processing = false;
                        //ボタンを有効にする
                        disabledOfInputAndBtn(false);
                        //ロード画像を消す
                        deleteLoadingAnimation();
                    }
                }
            })
        }
        else {
            //対応外のプログレスバー更新（Falure）が出来ないため時間をずらす
            setTimeout(() => {
                $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                $('#progress_' + i).addClass('bg-danger');
                $('#progress_' + i).html('Refused')
                fileInfo[i].fileList.status = 'Different file';
            }, 100)

            //表示する個数の更新
            resultOfCompression.updateQuantity();

            count++;
            if (count == totalCount) {
                //処理の終了
                processing = false;
                //ボタンを有効にする
                disabledOfInputAndBtn(false);
                //ロード画像を消す
                deleteLoadingAnimation();
            }
        }
    }

    /*setTimeout(function () {
        for(let i = 0; i < files.length; i++) {
            const status = fileInfo[i].fileList.status;
            if(status == 'success' || status == 'processing') {
                //処理なし
            } else {
                $('#file-input').attr('disabled', false);
                $('#download-btn').attr('disabled', false);
                $('#execute-btn').attr('disabled', false);

                //ロード画像を消す
                deleteLoadingAnimation();
            }
        }
    }, 1000);*/
}


function calculateSize(bites) {
    // ** は累乗の計算
    if (bites >= 1024 ** 3) {
        bites = Math.floor(bites / (1024 ** 3) * 10) / 10 + 'GB';
    }
    else if (bites >= 1024 ** 2) {
        bites = Math.floor(bites / (1024 ** 2) * 10) / 10 + 'MB';
    }
    else if (bites >= 1024) {
        bites = Math.floor(bites / 1024 * 10) / 10 + 'KB';
    }
    else {
        bites = bites + 'B';
    }

    return bites;
}

function disabledOfInputAndBtn(bool) {
    $('#file-input').attr('disabled', bool);
    $('#download-btn').attr('disabled', bool);
    $('#execute-btn').attr('disabled', bool);
}

function displayLoadingAnimation(type, comments = '') {
    if (type == 'normal') {
        $('#load-image').html('<img id="loading" src="images/gif/loadingGif/loading-orange.gif"><span id="comments">' + comments + '</span>');
    } else if (type == 'parrot') {
        $('#load-image').html('<img id="loading" src="images/gif/party parrot/parrot.gif"><span id="comments">' + comments + '</span>');
    } else if (type == 'fastparrot') {
        $('#load-image').html('<img id="loading" src="images/gif/party parrot/fastparrot.gif"><span id="comments">' + comments + '</span>');
    }
}

function deleteLoadingAnimation() {
    $('#load-image').html('');
}
