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

    //再実行ボタンと保存ボタンを無効にする
    disabledOfInputAndBtn(true);
    //ロード表示
    displayLoadingAnimation('parrot', 'saving...');

    //zipでダウンロード
    let zip = new JSZip();

    for (let i = 0; i < compressedFiles.length; i++) {
        zip.file(compressedFiles[i].name, compressedFiles[i], { base64: true });
    }
    //zipファイル作成
    zip.generateAsync({ type: 'blob' }).then(function (content) {
        //FileSaver.js
        saveAs(content, 'compressed.zip');

        //再実行ボタンと保存ボタンを有効にする
        disabledOfInputAndBtn(false);
        //ロード削除
        deleteLoadingAnimation()
    });

}, false)

executeBtn.addEventListener('click', function () {
    fileInfo.dropFile(droppedFiles);

    compressImages(droppedFiles);
});