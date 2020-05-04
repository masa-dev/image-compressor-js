let fileArea = document.getElementById('drag-drop-area');
let fileInput = document.getElementById('file-input');
let btn = document.getElementById('execute');
let droppedFiles;  //画像ファイルを格納する変数

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

    console.log(droppedFiles);
    console.log(droppedFiles[0].size / 1024 / 1024 + 'Mb')
});

btn.addEventListener('click', function () {
    let tempFiles;
    let compressedFiles = [];
    //ファイルが選択されていないとき
    if (droppedFiles == null) {
        if (document.getElementById('file-input').files[0] == null) {
            window.alert('ファイルが選択されていません');
            return;
        }
        else {
            tempFiles = document.getElementById('file-input').files;
        }
    }
    else {
        tempFiles = droppedFiles;
    }

    const imageQuality = document.getElementById('quality').value;

    for (let i = 0; i < tempFiles.length; i++) {
        if (tempFiles[i].type == 'image/jpeg') {
            const img = new Compressor(tempFiles[i], {
                quality: imageQuality,
                success(result) {
                    compressedFiles.push(result)
                },
                mineType: 'image/jpeg',
                error(err) {
                    alert('エラーが発生しました\n' + err);
                }
            })
        }

    }

    console.log(compressedFiles);

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