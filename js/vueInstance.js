let fileInfo = new Vue({
    el: '#file-info',
    data: {
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
        resetProgressBar(length) {
            for (let i = 0; i < length; i++) {
                $('#progress_' + i).removeClass('bg-danger bg-success');
                $('#progress_' + i).addClass('bg-info progress-bar-striped');
                $('#progress_' + i).html('Processing');
            }
        }
    }
})

let resultOfCompression = new Vue({
    el: '#result',
    data: {
        seen: false,
        totalSize: {
            origin: 0,
            compressed: 0,
            difference: 0,
            renamed: '0KB'
        },
        differencePercent: 0
    },
    methods: {
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