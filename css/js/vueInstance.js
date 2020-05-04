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