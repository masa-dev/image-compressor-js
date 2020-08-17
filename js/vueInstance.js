const fileInfo = new Vue({
    el: '#file-information',
    data: {
        seen: true,
        fileList: []
    },
    methods: {
        addFile: function (files) {
            for (let i = 0; i < files.length; i++) {
                let size = calculateSize(files[i].size);
                this.fileList.push({ id: i, name: files[i].name, size: size, compressedSize: '-', status: 'processing' });
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

})

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
})
