// webcomponent.js
class CustomFlatpickrDatePicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectMode = "day";
    this._darktheme = false;
    this._dateVal = null;
    this._secondDateVal = null;
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
      <div style="margin-bottom: 8px; font-size: 0.9em;">
        <label style="font-weight:bold; display:block; margin-bottom: 4px;">Modus wählen:</label>
        <label><input type="radio" name="mode" value="day" ${this._selectMode === "day" ? "checked" : ""}/> Tag</label>
        <label><input type="radio" name="mode" value="month" ${this._selectMode === "month" ? "checked" : ""}/> Monat</label>
        <label><input type="radio" name="mode" value="year" ${this._selectMode === "year" ? "checked" : ""}/> Jahr</label>
      </div>
      <input id="picker" style="padding:6px;width:100%;" />
    `;

    this.shadowRoot.querySelectorAll("input[name='mode']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.selectMode = e.target.value;
      });
    });

    this.initFlatpickr();
  }

  async initFlatpickr() {
    if (!window.flatpickr) {
      await import("https://cdn.jsdelivr.net/npm/flatpickr");
    }

    const input = this.shadowRoot.getElementById("picker");
    if (!input) return;

    if (this.fp) this.fp.destroy();

    const config = {
      defaultDate: this._dateVal,
      onChange: (selectedDates) => {
        const d = selectedDates[0];
        if (!(d instanceof Date) || isNaN(d)) return;

        if (this._selectMode === "day") {
          this._dateVal = d;
          this._secondDateVal = null;
        } else if (this._selectMode === "month") {
          const year = d.getFullYear();
          const month = d.getMonth();
          this._dateVal = new Date(year, month, 1);
          this._secondDateVal = new Date(year, month + 1, 0);
        } else if (this._selectMode === "year") {
          const year = d.getFullYear();
          this._dateVal = new Date(year, 0, 1);
          this._secondDateVal = new Date(year, 11, 31);
        }

        this.fireChanged();
      }
    };

    if (this._selectMode === "day") {
      config.dateFormat = "d.m.Y";
    } else if (this._selectMode === "month") {
      config.dateFormat = "m.Y";
      config.altInput = true;
      config.altFormat = "M Y";
    } else if (this._selectMode === "year") {
      config.dateFormat = "Y";
      config.altInput = true;
      config.altFormat = "Y";
      config.allowInput = false;
    }

    this.fp = flatpickr(input, config);

    if (this._dateVal) {
      this.fp.setDate(this._dateVal, true);
    }
  }

  fireChanged() {
    this.dispatchEvent(new CustomEvent("onChange", {
      detail: {
        dateVal: this._dateVal,
        secondDateVal: this._secondDateVal,
        selectMode: this._selectMode,
      }
    }));
  }

  set selectMode(value) {
    this._selectMode = value;
    this.render();
  }

  set darktheme(value) {
    this._darktheme = value;
    this.render();
  }

  set dateVal(value) {
    const parsed = new Date(value);
    if (parsed instanceof Date && !isNaN(parsed)) {
      this._dateVal = parsed;
      if (this.fp) this.fp.setDate(this._dateVal, true);
    }
  }

  set secondDateVal(value) {
    this._secondDateVal = new Date(value);
  }

  get dateVal() {
    return this._dateVal;
  }

  get secondDateVal() {
    return this._secondDateVal;
  }

  getStartDate() {
    return this._dateVal;
  }

  getEndDate() {
    return this._secondDateVal;
  }

  clear() {
    this._dateVal = null;
    this._secondDateVal = null;
    if (this.fp) this.fp.clear();
    this.fireChanged();
  }
}

customElements.define("custom-flatpickr-datepicker", CustomFlatpickrDatePicker);
