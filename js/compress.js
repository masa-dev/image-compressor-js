let fileArea = document.getElementById('drag-drop-area');
let fileInput = document.getElementById('file-input');
let droppedFiles = [];  //画像ファイルを格納する変数
let compressedFiles = [];

fileArea.addEventListener('dragover', function (evt) {
    evt.preventDefault();
    fileArea.classList.add('dragover');
});

fileArea.addEventListener('dragleave', function (evt) {
    evt.preventDefault();
    fileArea.classList.remove('dragover');
});

fileArea.addEventListener('drop', function (evt) {
    evt.preventDefault();
    fileArea.classList.remove('dragenter');
    //このdroppedFilesに画像データが入る
    droppedFiles = evt.dataTransfer.files;
    fileInput.files = droppedFiles;

    fileInfo.dropFile(droppedFiles);

    compressImages(droppedFiles);
});

fileInput.addEventListener('change', function (evt) {
    droppedFiles = evt.target.files;

    fileInfo.dropFile(evt.target.files);

    compressImages(droppedFiles);
}, false)


function compressImages(files) {
    const imageQuality = parseFloat(document.getElementById('quality').value);
    let maxWidth, maxHeight;
    let totalCount = 0, count = 0;
    compressedFiles.splice(0, compressedFiles.length);

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

    if(files.length != 0) {
        //ボタンを無効にする
        $('#file-input').attr('disabled', true);
        $('#download-btn').attr('disabled', true);
        $('#execute-btn').attr('disabled', true);

        //ロード画像を表示する
        displayLoadingAnimation();
    }

    //resultOfCompression を見えるようにする
    resultOfCompression.resetValue();
    if (files.length == 0) {
        resultOfCompression.seen = false;
    }
    else if (resultOfCompression.seen === false) {
        resultOfCompression.seen = true;
    }

    //合計の処理回数
    for (let i = 0; i < files.length; i++) {
        if (files[i].type == 'image/jpeg') {
            totalCount++;
        }
    }

    //画像の圧縮
    for (let i = 0; i < files.length; i++) {
        if (files[i].type == 'image/jpeg') {
            //非同期
            const img = new Compressor(files[i], {
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                quality: imageQuality,
                success(result) {
                    compressedFiles.push(result)
                    $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                    $('#progress_' + i).addClass('bg-success');
                    $('#progress_' + i).html('Finished')

                    let size = calculateSize(this.result.size);
                    let difference = Math.floor(((files[i].size - this.result.size) / files[i].size) * 100 * 10) / 10;

                    //fileInfo とデータを合わせて変更する
                    for (let j = 0; j < fileInfo.fileList.length; j++) {
                        if (fileInfo.fileList[j].name == this.result.name) {
                            fileInfo.fileList[j].compressedSize = size + ' (-' + difference + '%)';
                            fileInfo.fileList[j].status = 'success';
                        }
                    }

                    //resultOfCompression とデータを合わせて変更する
                    resultOfCompression.increaseValue(files[i].size, this.result.size);

                    count++;
                    if (count == totalCount) {
                        //ボタンを有効にする
                        $('#file-input').attr('disabled', false);
                        $('#download-btn').attr('disabled', false);
                        $('#execute-btn').attr('disabled', false);

                        //ロード画像を消す
                        deleteLoadingAnimation();
                    }
                },
                mineType: 'auto',
                error(err) {
                    alert('エラーが発生しました\n' + err);
                }
            })
        }
        else {
            setTimeout(() => {
                $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                $('#progress_' + i).addClass('bg-danger');
                $('#progress_' + i).html('Failure')
                fileInfo.fileList.status = 'Different file';
            }, 100)
        }
    }
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

function displayLoadingAnimation() {
    $('#load-image').html('<img id="loading" src="images/gif/party parrot/fastparrot.gif">');
}

function deleteLoadingAnimation() {
    $('#load-image').html('');
}
