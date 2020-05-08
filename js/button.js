const executeBtn = document.getElementById('execute-btn');
const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', function () {
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
        saveAs(content, 'compressed.zip');
    });

}, false)

executeBtn.addEventListener('click', function () {
    fileInfo.dropFile(droppedFiles);

    compressImages(droppedFiles);
})