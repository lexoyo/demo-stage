window.addEventListener('load', () => {
  require(['node_modules/drag-drop-stage-component/pub/js/index'], function({Stage}) {
    const iframe = document.querySelector('iframe')
    const stage = new Stage(iframe, iframe.contentDocument.querySelectorAll('.selectable'))
    setTimeout(() => {
      stage.redraw()
    }, 100);
  });
})