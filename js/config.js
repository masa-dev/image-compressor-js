const config = {
    processingOnFileInput: true,    //ファイルインプット時に処理する
    hideFileList: false, //ファイルリストを非表示にする

    get imageQuality() {
        let value = document.getElementById('quality').value
        return parseFloat(value);
    },

    get onlyJpeg() {
        return document.getElementById('only-jpeg').checked;
    },

    get convertJpeg() {
        return document.getElementById('convert-all-to-jpeg').checked;
    },

    //maxWidth と maxHeight の選択していないときに Infinity にする
    get maxWidth() {
        let value = document.getElementById('max-width').value;
        return value == "" ? Infinity : parseFloat(value);
    },

    get maxHeight() {
        let value = document.getElementById('max-height').value;
        return value == "" ? Infinity : parseFloat(value);
    },

    openModal: function () {
        const nameList = [
            { id: 'processing-file-input', property: 'processingOnFileInput' },
            { id: 'hide-file-list', property: 'hideFileList' }
        ]

        for (let name of nameList) {
            reflectsCheck(name.id, name.property);
        }

        function reflectsCheck(idName, propertyName) {
            let element = document.getElementById(idName);
            if (element.checked != config[propertyName]) {
                element.parentNode.click();
            }
        }
    },
    closeModal: function () {
        document.getElementById('close-modal-btn').click();
    },
    applyConfig: function () {
        this.processingOnFileInput = document.getElementById('processing-file-input').checked;
        this.hideFileList = document.getElementById('hide-file-list').checked;

        fileInfo.seen = !this.hideFileList;

        this.closeModal();
    }
}