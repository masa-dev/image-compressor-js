let fileInfo = new Vue({
    el: '#file-info',
    data: {
        fileList: []
    },
    methods: {
        addFile: function (files) {
            for (let i = 0; i < files.length; i++) {
                let size = files[i].size / 1024;
                if (size > 1024) {
                    size = Math.floor(size / 1024 * 10) / 10 + 'MB';
                } else {
                    size = Math.floor(size * 10) / 10 + 'KB';
                }
                this.fileList.push({ id: i, name: files[i].name, size: size, status: 'processing' });
            }
        },
        deleteFile: function () {
            this.fileList.splice(0, this.fileList.length);
        },
        dropFile: function (files) {
            this.deleteFile();
            this.addFile(files);
        }
    }
})