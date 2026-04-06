/**
 * Copyright 2026 Dylan Dayrit
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import "./lib/insta-slide.js";
import "./lib/insta-slide-arrow.js";
import "./lib/insta-slide-indicator.js";
import "./lib/insta-interaction-bar.js";

/**
 * `insta-project`
 * 
 * @demo index.html
 * @element insta-project
 */

export class InstaProject extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "insta-project";
  }

  constructor() {
    super();
    this.title = "";
    this.currentIndex = 0;
    this.totalSlides = 0;
    this.slides = [];
    this.postData = null;
    this.isOverlayOpen = false;
    this.activeOverlayImage = null;
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      currentIndex: { type: Number },
      totalSlides: { type: Number },
      slides: { type: Array},
      postData: { type: Object },
      isOverlayOpen: { type: Boolean },
      activeOverlayImage: { type: Object }
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`

      :host {
        display: block;
        color: light-dark(var(--ddd-theme-default-beaverBlue), var(--ddd-theme-default-white));
        background-color: light-dark(var(--ddd-theme-default-slateMaxLight), var(--ddd-theme-default-coalyGray));
        font-family: var(--ddd-font-navigation);
        border-radius: var(--ddd-radius-sm);
        position: relative;
        width: 360px;
        height: 600px;
      }
      .wrapper {
        position: relative;
        display: block;
        height: 100%;
        margin: var(--ddd-spacing-2);
        padding-left: var(--ddd-spacing-4);
        padding-right: var(--ddd-spacing-4);
      }
      .wrapper > slot {
        flex: 1 1 auto;
        display: block;
      }
      .header {
        display: flex;
        align-items: center;
      }
      .profile-picture {
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: var(--ddd-radius-circle);
        margin-right: var(--ddd-spacing-2);
      }
      .slides-container {
        display: flex;
        justify-content: center;
      }
      insta-slide-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }
      insta-slide-arrow[direction="previous"] {
        left: -32px;
      }
      insta-slide-arrow[direction="next"] {
        right: -32px;
      }
      insta-slide-indicator {
        left: var(--ddd-spacing-8);
      }
      .overlay-backdrop {
        position: fixed;
        top: var(--ddd-spacing-0);
        left: var(--ddd-spacing-0);
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .overlay-card {
        text-align: center;
      }
      .overlay-card img {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
      }
      .overlay-card button {
        background-color: var(--ddd-theme-default-nittanyNavy);
        color: var(--ddd-theme-default-white);
        border: var(--ddd-border-xs);
        border-radius: var(--ddd-radius-sm);
        padding: var(--ddd-spacing-2) var(--ddd-spacing-4);
        border-color: var(--ddd-theme-default-potential0);
      }
      .overlay-card button:hover {
        background-color: var(--ddd-theme-default-beaverBlue);
      }
    `];
  }

  nextSlide() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.updateSlides();
  }

  previousSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.totalSlides - 1;
    }
    this.updateSlides();
  }

  openOverlay(image) {
    this.activeOverlayImage = image;
    this.isOverlayOpen = true;
  }

  async firstUpdated() {
    const response = await fetch(new URL('./lib/insta-post.json', import.meta.url).href);
    const jsonData = await response.json();
    this.postData = jsonData;
    this.slides = jsonData.images;
    this.totalSlides = this.slides.length;

    const urlParams = new URLSearchParams(window.location.search);
    const urlSlide = urlParams.get('slide');
    if (urlSlide !== null) {
    const requestedIndex = parseInt(urlSlide);
    if (requestedIndex >= 0 && requestedIndex < this.totalSlides) {
      this.currentIndex = requestedIndex;
    }
  }
    this.updateSlides();
  }

  updateSlides() {
    this.slides.forEach((slide, i) => {
      slide.active = (i === this.currentIndex);
    });
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('slide', this.currentIndex);
    window.history.pushState({}, '', currentUrl);
    const indexChange = new CustomEvent("insta-index-changed", {
      composed: true,
      bubbles: true,
      detail: {
        index: this.currentIndex
      },
    });
    this.dispatchEvent(indexChange);
  }

  // Lit render the HTML
  render() {
    if (!this.postData) {
      return html`<div class="loading-skeleton"></div>`;
    }

    return html`
      <div class="wrapper">
        <div class="header">
          <img class="profile-picture" src="${this.postData?.author['profile-picture']}" width="30">
          <span>${this.postData?.author.username}</span>
        </div>
        <div class="slides-container">
        ${this.slides.map((image, index) => html`
          <insta-slide 
            .thumbnailSource="${image['thumbnail-source']}" 
            .fullSizeSource="${image['full-size-source']}"
            .alt="${image.alt}"
            @click="${() => this.openOverlay(image)}"
            ?active="${index === this.currentIndex}">
          </insta-slide>
        `)}
        </div>
        ${this.isOverlayOpen ? html`
          <div class="overlay-backdrop" @click="${() => this.isOverlayOpen = false}">
            <div class="overlay-card" @click="${(e) => e.stopPropagation()}">
              <img src="${this.activeOverlayImage['full-size-source']}" />
              <p>${this.activeOverlayImage.alt}</p>
              <button @click="${() => this.isOverlayOpen = false}">Close</button>
            </div>
          </div>
        ` : ''}
        <div class="body">
          <insta-slide-arrow direction="previous" @click="${this.previousSlide}"></insta-slide-arrow>
          <insta-slide-arrow direction="next" @click="${this.nextSlide}"></insta-slide-arrow>
          <insta-slide-indicator .totalSlides="${this.totalSlides}" .currentIndex="${this.currentIndex}"
            @indicator-change="${(e) => {
              this.currentIndex = e.detail.index;
              this.updateSlides();
            }}">
          </insta-slide-indicator>
          <insta-interaction-bar></insta-interaction-bar>
          <div class="description">${this.postData?.post.description}</div>
        </div>
      </div>
      `;
  }
}

// todo: Use thumbnails for on hover of user profile which shows # followers and # following on hover
globalThis.customElements.define(InstaProject.tag, InstaProject);