const config = {
    imageFileName: '',
    folderName: 'pdf-image',

    // Modal Window //
    type: 'image/jpeg',
    quality: 0.8,
    scale: 1.5,
    // Modal Window //

    threeDigit: true,
    noUnderscore: false,

    openModal: function () {
        const nameList = [
            { property: 'type' },
            { property: 'quality' },
            { property: 'scale' },
        ];

        for (let name of nameList) {
            let element = configElement[name.property];
            if (element.value != this[name.property]) {
                element.value = this[name.property];
            }
        }
    },
    closeModal: function () {
        document.getElementById('close-modal-btn').click();
    },
    applyConfigOfModal: function () {
        this.type = configElement.type.value;
        this.quality = parseFloat(configElement.quality.value);
        this.scale = parseFloat(configElement.scale.value);

        this.closeModal();
    },
    applyConfigOfProcess: function () {
        if (configElement.folderName.value == '') {
            this.folderName = 'pdf-image';
        } else {
            this.folderName = configElement.folderName.value;
        }

        this.imageFileName = configElement.imageFileName.value;

        this.threeDigit = configElement.threeDigit.checked;
        this.noUnderscore = configElement.noUnderscore.checked;
    }
};

const configElement = {
    imageFileName: document.getElementById('image-file-name'),
    folderName: document.getElementById('folder-name'),
    type: document.getElementById('image-file-type'),
    quality: document.getElementById('file-quality'),
    scale: document.getElementById('image-scale'),
    threeDigit: document.getElementById('three-digit-number'),
    noUnderscore: document.getElementById('no-underscore')
};