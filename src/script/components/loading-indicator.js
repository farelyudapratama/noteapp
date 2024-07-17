class LoadingIndicator extends HTMLElement {
  _shadowRoot = null;
  _style = null;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._style = document.createElement("style");
  }

  _updateStyle() {
    this._style.textContent = `
            :host {
                display: none;
            }
            .popup {
                z-index: 100;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            .loader {
                top: 50%;
                left: 50%;
                position: absolute;
                border: 5px solid #f3f3f3; /* Light grey */
                border-top: 5px solid #3498db; /* Blue */
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
  }

  _emptyContent() {
    this._shadowRoot.innerHTML = "";
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this._emptyContent();
    this._updateStyle();
    this._shadowRoot.innerHTML = "";
    this._shadowRoot.appendChild(this._style);
    this._shadowRoot.innerHTML += `
            <div class="popup">
                <div class="loader"></div>
            </div>
        `;
  }

  show() {
    this.style.display = "flex";
  }

  hide() {
    this.style.display = "none";
  }
}

customElements.define("loading-indicator", LoadingIndicator);
