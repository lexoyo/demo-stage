window.addEventListener('load', () => {
  require(['drag-drop-stage-component/index'], function({Stage}) {
    const iframe = document.querySelector('iframe')
    const stage = new Stage(iframe, iframe.contentDocument.querySelectorAll('.selectable'))
    setTimeout(() => {
      stage.redraw()
    }, 100);
  });
})