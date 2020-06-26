FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
) 
FilePond.setOptions({
    stylePanelAspectRatio: 10 / 10,
    imageResizeTargetWidth: 20,
    imageResizeTargetHeight: 20,
})
FilePond.parse(document.body)
