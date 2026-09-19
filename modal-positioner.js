window.modalPositioner = {
    show: () => {
        const dialog = document.querySelector('.media-viewer-dialog');
        if (dialog && !dialog.open) dialog.showModal();
    },
    close: () => {
        const dialog = document.querySelector('.media-viewer-dialog');
        if (dialog?.open) dialog.close();
    }
};
