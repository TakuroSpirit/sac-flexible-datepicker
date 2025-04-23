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
      <div style="margin-bottom: 6px;">
        <label style="font-weight:bold; font-size: 0.85em;">Modus wählen:</label>
        <select id="modeSelect" style="padding:4px; width: 100%;">
          <option value="day">Tag</option>
          <option value="month">Monat</option>
          <option value="year">Jahr</option>
        </select>
      </div>
      <input id="picker" style="padding:6px;width:100%;" />
    `;

    this.shadowRoot.getElementById("modeSelect").value = this._selectMode;
    this.shadowRoot.getElementById("modeSelect").addEventListener("change", (e) => {
      this.selectMode = e.target.value;
    });

    this.loadAndInitFlatpickr();
  }

  async loadAndInitFlatpickr() {
    if (!window.flatpickr) {
      await import('https://cdn.jsdelivr.net/npm/flatpickr');
    }
    if (this._selectMode === "month") {
      await import('https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/index.js');
      if (!document.getElementById("flatpickr-month-css")) {
        const styleLink = document.createElement("link");
        styleLink.id = "flatpickr-month-css";
        styleLink.rel = "stylesheet";
        styleLink.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/style.css";
        document.head.appendChild(styleLink);
      }
    }
    this.initFlatpickr();
  }

  initFlatpickr() {
    const input = this.shadowRoot.getElementById("picker");
    if (!input) return;

    if (this.fp) this.fp.destroy();

    const config = {
      dateFormat: "Y-m-d",
      onChange: (selectedDates) => {
        if (this._selectMode === "year") {
          const year = selectedDates[0].getFullYear();
          this._dateVal = new Date(year, 0, 1);
          this._secondDateVal = new Date(year, 11, 31);
        } else if (this._selectMode === "month") {
          const d = selectedDates[0];
          this._dateVal = new Date(d.getFullYear(), d.getMonth(), 1);
          this._secondDateVal = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        } else {
          this._dateVal = selectedDates[0];
          this._secondDateVal = selectedDates[1] || null;
        }
        this.fireChanged();
      }
    };

    if (this._selectMode === "month") {
      config.dateFormat = "Y-m";
      config.altFormat = "F Y";
      config.plugins = [
        new flatpickr.plugins.monthSelectPlugin({
          shorthand: true,
          dateFormat: "Y-m",
          altFormat: "F Y"
        })
      ];
    } else if (this._selectMode === "year") {
      config.dateFormat = "Y";
      config.onReady = (selectedDates, dateStr, instance) => {
        instance.currentYearElement.type = "number";
        instance.currentYearElement.step = 1;
        instance.daysContainer.style.display = "none";
        instance.monthElements.forEach(el => el.style.display = "none");
      };
    } else if (this._selectMode === "day") {
      config.mode = "single";
    }

    this.fp = flatpickr(input, config);
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
    this._dateVal = new Date(value);
    if (this.fp) this.fp.setDate(this._dateVal);
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
}

customElements.define("custom-flatpickr-datepicker", CustomFlatpickrDatePicker);
