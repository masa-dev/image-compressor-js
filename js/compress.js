let fileArea = document.getElementById('drag-drop-area');
let fileInput = document.getElementById('file-input');
let btn = document.getElementById('execute');
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

btn.addEventListener('click', function () {
    //ファイルが選択されていないとき
    if (compressedFiles[0] == null) {
        if (document.getElementById('file-input').files[0] == null) {
            window.alert('ファイルが選択されていません');
            return;
        }
    }


    //zipでダウンロード
    let zip = new JSZip();

    for (let i = 0; i < compressedFiles.length; i++) {
        zip.file(compressedFiles[i].name, compressedFiles[i], { base64: true });
    }
    //zipファイル作成
    zip.generateAsync({ type: 'blob' }).then(function (content) {
        //FileSaver.js
        saveAs(content, 'images.zip');
    });

}, false)

function compressImages(files) {
    const imageQuality = document.getElementById('quality').value;
    compressedFiles.splice(0, compressedFiles.length);

    //画像の圧縮
    for (let i = 0; i < files.length; i++) {
        if (files[i].type == 'image/jpeg') {
            //非同期
            const img = new Compressor(files[i], {
                quality: imageQuality,
                success(result) {
                    compressedFiles.push(result)
                    $('#progress_' + i).removeClass('bg-info progress-bar-striped');
                    $('#progress_' + i).addClass('bg-success');
                    $('#progress_' + i).html('Finished')

                    let size = calculateSize(this.result.size);
                    let distance = Math.floor((this.result.size / files[i].size) * 100 * 10) / 10;

                    //fileInfo とデータを合わせて変更する
                    for (let j = 0; j < fileInfo.fileList.length; j++) {
                        if (fileInfo.fileList[j].name == this.result.name) {
                            fileInfo.fileList[j].compressedSize = size + ' (-' + distance + '%)';
                            fileInfo.fileList[j].status = 'success';
                        }
                    }
                },
                mineType: 'image/jpeg',
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