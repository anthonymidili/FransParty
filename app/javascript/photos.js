document.addEventListener('turbo:load', function () {
  const photoModal = document.getElementById('photoModal')
  if (!photoModal) return

  const closeBtn = photoModal.querySelector('.btn-close')
  const modalBody = photoModal.querySelector('.modal-body')

  function pinCloseBtn() {
    const vv = window.visualViewport
    closeBtn.style.top = (vv.offsetTop + 20) + 'px'
    closeBtn.style.right = (document.documentElement.clientWidth - vv.offsetLeft - vv.width + 20) + 'px'
  }

  // --- Custom pinch-to-zoom + pan via CSS transform (works on all devices) ---
  let modalScale = 1
  let panX = 0, panY = 0
  let pinchStartDist = 0
  let pinchStartScale = 1
  let isPanning = false
  let panStartX = 0, panStartY = 0
  let panOriginX = 0, panOriginY = 0

  function getTouchDist(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    )
  }

  function applyTransform() {
    const img = document.getElementById('modalPhoto')
    if (!img) return
    if (modalScale <= 1) {
      img.style.transform = ''
      img.style.cursor = ''
    } else {
      img.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + modalScale + ')'
      img.style.cursor = 'grab'
    }
  }

  function setModalScale(s) {
    modalScale = Math.max(1, Math.min(s, 8))
    if (modalScale === 1) { panX = 0; panY = 0 }
    applyTransform()
  }

  function onPinchStart(e) {
    if (e.touches.length === 2) {
      pinchStartDist = getTouchDist(e.touches)
      pinchStartScale = modalScale
    }
  }

  function onPinchMove(e) {
    if (e.touches.length !== 2) return
    e.preventDefault()
    setModalScale(pinchStartScale * (getTouchDist(e.touches) / pinchStartDist))
  }

  // Single-finger pan (touch)
  function onTouchPanStart(e) {
    if (e.touches.length !== 1 || modalScale <= 1) return
    isPanning = true
    panStartX = e.touches[0].clientX
    panStartY = e.touches[0].clientY
    panOriginX = panX
    panOriginY = panY
  }

  function onTouchPanMove(e) {
    if (!isPanning || e.touches.length !== 1) return
    e.preventDefault()
    panX = panOriginX + (e.touches[0].clientX - panStartX)
    panY = panOriginY + (e.touches[0].clientY - panStartY)
    applyTransform()
  }

  function onTouchPanEnd() {
    isPanning = false
  }

  // Mouse drag pan (desktop)
  function onMousePanStart(e) {
    if (modalScale <= 1) return
    isPanning = true
    panStartX = e.clientX
    panStartY = e.clientY
    panOriginX = panX
    panOriginY = panY
    const img = document.getElementById('modalPhoto')
    if (img) img.style.cursor = 'grabbing'
    e.preventDefault()
  }

  function onMousePanMove(e) {
    if (!isPanning) return
    panX = panOriginX + (e.clientX - panStartX)
    panY = panOriginY + (e.clientY - panStartY)
    applyTransform()
  }

  function onMousePanEnd() {
    if (!isPanning) return
    isPanning = false
    const img = document.getElementById('modalPhoto')
    if (img) img.style.cursor = 'grab'
  }

  // Desktop: trackpad pinch sends ctrl+wheel
  function onWheelZoom(e) {
    if (!e.ctrlKey) return
    e.preventDefault()
    setModalScale(modalScale * Math.pow(0.99, e.deltaY))
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
    closeBtn.style.top = '20px'
    closeBtn.style.right = '20px'
    if (window.visualViewport) {
      pinCloseBtn()
      window.visualViewport.addEventListener('scroll', pinCloseBtn)
      window.visualViewport.addEventListener('resize', pinCloseBtn)
    }
    // Attach custom zoom + pan handlers
    modalBody.style.touchAction = 'none'
    modalBody.addEventListener('touchstart', onPinchStart, { passive: true })
    modalBody.addEventListener('touchstart', onTouchPanStart, { passive: true })
    modalBody.addEventListener('touchmove', onPinchMove, { passive: false })
    modalBody.addEventListener('touchmove', onTouchPanMove, { passive: false })
    modalBody.addEventListener('touchend', onTouchPanEnd, { passive: true })
    modalBody.addEventListener('mousedown', onMousePanStart)
    window.addEventListener('mousemove', onMousePanMove)
    window.addEventListener('mouseup', onMousePanEnd)
    modalBody.addEventListener('wheel', onWheelZoom, { passive: false })
  })

  // Blur focused elements before Bootstrap sets aria-hidden, unpin close button, reset zoom
  photoModal.addEventListener('hide.bs.modal', function () {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('scroll', pinCloseBtn)
      window.visualViewport.removeEventListener('resize', pinCloseBtn)
    }
    closeBtn.style.cssText = ''
    if (photoModal.contains(document.activeElement)) {
      document.activeElement.blur()
    }
    // Reset zoom + pan and detach handlers
    setModalScale(1)
    modalBody.style.touchAction = ''
    modalBody.removeEventListener('touchstart', onPinchStart)
    modalBody.removeEventListener('touchstart', onTouchPanStart)
    modalBody.removeEventListener('touchmove', onPinchMove)
    modalBody.removeEventListener('touchmove', onTouchPanMove)
    modalBody.removeEventListener('touchend', onTouchPanEnd)
    modalBody.removeEventListener('mousedown', onMousePanStart)
    window.removeEventListener('mousemove', onMousePanMove)
    window.removeEventListener('mouseup', onMousePanEnd)
    modalBody.removeEventListener('wheel', onWheelZoom)
  })

  photoModal.addEventListener('hidden.bs.modal', function () {
    const modalPhoto = document.getElementById('modalPhoto')
    modalPhoto.src = ''
    delete modalPhoto.dataset.pendingSrc
  })
})
