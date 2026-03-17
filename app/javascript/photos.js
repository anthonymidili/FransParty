document.addEventListener('turbo:load', function () {
  const photoModal = document.getElementById('photoModal')
  if (!photoModal) return

  photoModal.addEventListener('show.bs.modal', function (event) {
    const img = event.relatedTarget
    document.getElementById('modalPhoto').src = img.dataset.src
  })

  photoModal.addEventListener('hidden.bs.modal', function () {
    document.getElementById('modalPhoto').src = ''
  })
})
