'use strict';

const config = {
    processingOnFileInput: true,    //ファイルインプット時に処理する
    hideFileList: false, //ファイルリストを非表示にする
    applyHistory: true,

    get imageQuality() {
        let value = document.getElementById('quality').value;
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

    history: {
        historySavedNum: 5,
        localStorageKeyName: '_ic_config_history',
        list: [],

        save: function () {
            let h = {
                    quality: config.imageQuality,
                    maxWidth: config.maxWidth,
                    maxHeight: config.maxHeight,
                    onlyJpeg: config.onlyJpeg,
                    convertJpeg: config.convertJpeg,
                    processingOnFileInput: config.processingOnFileInput,
                    hideFileList: config.hideFileList,
                    applyHistory: config.applyHistory
                }

            // 配列でない場合，初期化する
            if(!Array.isArray(this.list)) {
                this.list = [];
            }

            this.list.unshift(h);   // 先頭に追加
            if (this.list.length > this.historySavedNum) {
                this.list.pop();    // 末尾を削除
            }

            this.setLocalStrage();
        },
        setLocalStrage: function () {
            let str = JSON.stringify(this.list);
            localStorage.setItem(this.localStorageKeyName, str);
        },
        getLocalStrage: function () {
            let str = localStorage.getItem(this.localStorageKeyName);
            this.list = JSON.parse(str);
        },
        apply: function () {
            if (!Array.isArray(this.list)) {
                return;
            }
            let item = this.list[0];

            config.applyHistory = item.applyHistory;

            if (item.applyHistory) {
                document.getElementById('quality').value = item.quality;
                document.getElementById('only-jpeg').checked = item.onlyJpeg;
                document.getElementById('max-width').value = item.maxWidth;
                document.getElementById('max-height').value = item.maxHeight;
                document.getElementById('convert-all-to-jpeg').checked = item.convertJpeg;
                config.processingOnFileInput = item.processingOnFileInput;
                config.hideFileList = item.hideFileList;
            }
        }

    },

    openModal: function () {
        const nameList = [
            { id: 'processing-file-input', property: 'processingOnFileInput' },
            { id: 'hide-file-list', property: 'hideFileList' },
            { id: 'apply-history', property: 'applyHistory' }
        ]

        for (let name of nameList) {
            reflectsCheck(name.id, name.property);
        }

        function reflectsCheck(idName, propertyName) {
            let element = document.getElementById(idName);
            if (element.checked != config[propertyName]) {
                element.parentElement.click();
            }
        }
    },
    closeModal: function () {
        document.getElementById('close-modal-btn').click();
    },
    applyConfig: function () {
        this.processingOnFileInput = document.getElementById('processing-file-input').checked;
        this.hideFileList = document.getElementById('hide-file-list').checked;
        this.applyHistory = document.getElementById('apply-history').checked;

        fileInfo.seen = !this.hideFileList;

        this.history.save();
        this.closeModal();
    }
}