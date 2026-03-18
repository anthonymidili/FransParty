document.addEventListener('turbo:load', function () {
  const photoModal = document.getElementById('photoModal')
  if (!photoModal) return

  // Start fetching the full-size image on hover so it's (partially) cached by click time
  document.addEventListener('pointerover', function (event) {
    const thumb = event.target.closest('img[data-src]')
    if (!thumb || thumb._preloaded) return
    thumb._preloaded = true
    new Image().src = thumb.dataset.src
  })

  photoModal.addEventListener('show.bs.modal', function (event) {
    const trigger = event.relatedTarget
    const fullSrc = trigger.dataset.src
    const modalPhoto = document.getElementById('modalPhoto')

    // Show the thumbnail immediately for instant feedback while full-size loads
    modalPhoto.src = trigger.src
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

  photoModal.addEventListener('hidden.bs.modal', function () {
    const modalPhoto = document.getElementById('modalPhoto')
    modalPhoto.src = ''
    delete modalPhoto.dataset.pendingSrc
  })
})
