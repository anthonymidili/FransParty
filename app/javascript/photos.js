document.addEventListener('turbo:load', function () {
  const photoModal = document.getElementById('photoModal')
  if (!photoModal) return

  const closeBtn = photoModal.querySelector('.btn-close')

  function pinCloseBtn() {
    const vv = window.visualViewport
    closeBtn.style.top = (vv.offsetTop + 12) + 'px'
    closeBtn.style.right = (document.documentElement.clientWidth - vv.offsetLeft - vv.width + 12) + 'px'
  }

  // Start fetching the full-size image on hover so it's (partially) cached by click time
  document.addEventListener('pointerover', function (event) {
    const btn = event.target.closest('button[data-src]')
    if (!btn || btn._preloaded) return
    btn._preloaded = true
    new Image().src = btn.dataset.src
  })

  photoModal.addEventListener('show.bs.modal', function (event) {
    const trigger = event.relatedTarget
    const fullSrc = trigger.dataset.src
    const modalPhoto = document.getElementById('modalPhoto')

    // Show the thumbnail immediately for instant feedback while full-size loads
    modalPhoto.src = trigger.querySelector('img').src
    modalPhoto.dataset.pendingSrc = fullSrc

    const full = new Image()
    full.onload = function () {
      if (modalPhoto.dataset.pendingSrc === fullSrc) {
        modalPhoto.src = fullSrc
        delete modalPhoto.dataset.pendingSrc
      }
    }
    full.src = fullSrc
  })

  // Pin close button to visual viewport after animation so it survives pinch-zoom
  photoModal.addEventListener('shown.bs.modal', function () {
    closeBtn.style.position = 'fixed'
    closeBtn.style.zIndex = '1056'
    closeBtn.style.top = '12px'
    closeBtn.style.right = '12px'
    if (window.visualViewport) {
      pinCloseBtn()
      window.visualViewport.addEventListener('scroll', pinCloseBtn)
      window.visualViewport.addEventListener('resize', pinCloseBtn)
    }
  })

  // Blur focused elements before Bootstrap sets aria-hidden, and unpin close button
  photoModal.addEventListener('hide.bs.modal', function () {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('scroll', pinCloseBtn)
      window.visualViewport.removeEventListener('resize', pinCloseBtn)
    }
    closeBtn.style.cssText = ''
    if (photoModal.contains(document.activeElement)) {
      document.activeElement.blur()
    }
  })

  photoModal.addEventListener('hidden.bs.modal', function () {
    const modalPhoto = document.getElementById('modalPhoto')
    modalPhoto.src = ''
    delete modalPhoto.dataset.pendingSrc
  })
})
