// aps_webcomponent.js
class CustomFlatpickrDatePickerAps extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        label {
          display: block;
          margin-top: 8px;
          font-weight: bold;
        }
        select, input {
          padding: 4px;
          margin-top: 4px;
          width: 100%;
        }
      </style>
      <label for="mode">Auswahlmodus</label>
      <select id="mode">
        <option value="day">Tag</option>
        <option value="month">Monat</option>
        <option value="year">Jahr</option>
      </select>

      <label>
        <input type="checkbox" id="theme" /> Dunkles Theme verwenden
      </label>
    `;

    this.shadowRoot.getElementById("mode").addEventListener("change", this._submit.bind(this));
    this.shadowRoot.getElementById("theme").addEventListener("change", this._submit.bind(this));
  }

  _submit() {
    const mode = this.shadowRoot.getElementById("mode").value;
    const dark = this.shadowRoot.getElementById("theme").checked;

    this.dispatchEvent(
      new CustomEvent("propertiesChanged", {
        detail: {
          properties: {
            selectMode: mode,
            darktheme: dark,
          },
        },
      })
    );
  }

  set selectMode(value) {
    this.shadowRoot.getElementById("mode").value = value;
  }

  get selectMode() {
    return this.shadowRoot.getElementById("mode").value;
  }

  set darktheme(value) {
    this.shadowRoot.getElementById("theme").checked = value;
  }

  get darktheme() {
    return this.shadowRoot.getElementById("theme").checked;
  }
}

customElements.define("custom-flatpickr-datepicker-aps", CustomFlatpickrDatePickerAps);