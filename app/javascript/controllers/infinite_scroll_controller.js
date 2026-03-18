import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["sentinel"]
  static values = { nextPage: Number }

  initialize() {
    this.observer = new IntersectionObserver(this.#onIntersect, { rootMargin: "200px" })
  }

  disconnect() {
    this.observer.disconnect()
  }

  sentinelTargetConnected(target) {
    this.observer.observe(target)
  }

  sentinelTargetDisconnected(target) {
    this.observer.unobserve(target)
  }

  #onIntersect = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loading) {
        this.#loadMore()
      }
    })
  }

  async #loadMore() {
    this.loading = true

    const response = await fetch(`${window.location.pathname}?page=${this.nextPageValue}`, {
      headers: { Accept: "text/vnd.turbo-stream.html" }
    })

    if (response.ok) {
      const html = await response.text()
      this.nextPageValue++
      this.loading = false
      Turbo.renderStreamMessage(html)
    } else {
      this.loading = false
    }
  }
}
