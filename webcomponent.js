// webcomponent.js
class CustomFlatpickrDatePicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectMode = "day";
    this._darktheme = false;
    this._dateVal = new Date();
    this._secondDateVal = null;
    this._displayYear = new Date().getFullYear();
  }

  connectedCallback() {
    this.injectFlatpickrStyle();
    this.render();
  }

  injectFlatpickrStyle() {
    if (!document.getElementById("flatpickr-style")) {
      const styleLink = document.createElement("link");
      styleLink.id = "flatpickr-style";
      styleLink.rel = "stylesheet";
      styleLink.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
      document.head.appendChild(styleLink);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #f9f9f9;
          cursor: pointer;
        }
        button:hover {
          background-color: #e0e0e0;
          transition: background-color 0.2s;
        }
        input[type="text"], select {
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        #picker {
          height: 44px;
          line-height: 44px;
          padding: 0 12px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
        }
      </style>
      <div style="background: #fff; border: 1px solid #ccc; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 8px; font-size: 0.9em;">
          <label style="font-weight:bold; display:block; margin-bottom: 4px;">Filtern auf:</label>
          <label><input type="radio" name="mode" value="day" ${this._selectMode === "day" ? "checked" : ""}/> Tag</label>
          <label><input type="radio" name="mode" value="month" ${this._selectMode === "month" ? "checked" : ""}/> Monat</label>
          <label><input type="radio" name="mode" value="year" ${this._selectMode === "year" ? "checked" : ""}/> Jahr</label>
        </div>
        <div id="custom-input" style="margin-bottom:16px;"></div>
        <div id="quick-buttons" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;"></div>
      </div>
    `;

    this.shadowRoot.querySelectorAll("input[name='mode']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.selectMode = e.target.value;
        this.fireChanged();
      });
    });

    this.renderCustomInput();
    this.renderQuickButtons();
  }

  // rest bleibt unverändert
}

customElements.define("custom-flatpickr-datepicker", CustomFlatpickrDatePicker);
