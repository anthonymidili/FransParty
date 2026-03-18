import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "progress", "progressBar", "submitBtn", "status"]

  connect() {
    this.uploads = {}
    this.element.addEventListener("direct-upload:initialize", this.#onInitialize)
    this.element.addEventListener("direct-upload:progress", this.#onProgress)
    this.element.addEventListener("direct-upload:end", this.#onFileEnd)
    this.element.addEventListener("direct-uploads:start", this.#onStart)
    this.element.addEventListener("direct-uploads:end", this.#onEnd)
  }

  disconnect() {
    this.element.removeEventListener("direct-upload:initialize", this.#onInitialize)
    this.element.removeEventListener("direct-upload:progress", this.#onProgress)
    this.element.removeEventListener("direct-upload:end", this.#onFileEnd)
    this.element.removeEventListener("direct-uploads:start", this.#onStart)
    this.element.removeEventListener("direct-uploads:end", this.#onEnd)
  }

  filesSelected() {
    const count = this.inputTarget.files.length
    this.statusTarget.textContent = count > 0
      ? `${count} photo${count !== 1 ? "s" : ""} selected`
      : "Select one or more photos to upload."
  }

  #onInitialize = (event) => {
    this.uploads[event.detail.id] = 0
  }

  #onStart = () => {
    this.progressTarget.classList.remove("d-none")
    this.submitBtnTarget.disabled = true
    this.submitBtnTarget.textContent = "Uploading..."
    this.#updateProgress()
  }

  #onProgress = (event) => {
    this.uploads[event.detail.id] = event.detail.progress
    this.#updateProgress()
  }

  #onFileEnd = (event) => {
    this.uploads[event.detail.id] = 100
    this.#updateProgress()
  }

  #onEnd = () => {
    // All files uploaded to storage; form is now being submitted to Rails
    this.progressBarTarget.style.width = "100%"
    this.progressBarTarget.setAttribute("aria-valuenow", 100)
    this.statusTarget.textContent = "Saving..."
  }

  #updateProgress() {
    const ids = Object.keys(this.uploads)
    if (ids.length === 0) return
    const total = ids.reduce((sum, id) => sum + this.uploads[id], 0)
    const avg = Math.round(total / ids.length)
    this.progressBarTarget.style.width = `${avg}%`
    this.progressBarTarget.setAttribute("aria-valuenow", avg)
    this.statusTarget.textContent = `Uploading ${ids.length} photo${ids.length !== 1 ? "s" : ""}... ${avg}%`
  }
}
