// webcomponent.js
class CustomFlatpickrDatePicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectMode = "day";
    this._darktheme = false;
    this._dateVal = null;
    this._secondDateVal = null;
    this.monthSelectPlugin = null;
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

    this.loadAndInitFlatpickr();
  }

  async loadAndInitFlatpickr() {
    if (!window.flatpickr) {
      await import('https://cdn.jsdelivr.net/npm/flatpickr');
    }

    if (this._selectMode === "month") {
      const pluginModule = await import('https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/index.js');
      this.monthSelectPlugin = pluginModule.default;

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

    const isValidDate = (d) => d instanceof Date && !isNaN(d);

    const config = {
      dateFormat: "Y-m-d",
      defaultDate: isValidDate(this._dateVal) ? this._dateVal : null,
      onChange: (selectedDates) => {
        const d = selectedDates[0];
        if (!isValidDate(d)) return;

        if (this._selectMode === "day") {
          this._dateVal = d;
          this._secondDateVal = selectedDates[1] || null;
          this.fireChanged();
        } else {
          if (this.fp) this.fp.setDate(d, true);
        }
      },
      onOpen: (selectedDates, dateStr, instance) => {
        if (this._selectMode === "year") {
          setTimeout(() => {
            const yearElements = instance.calendarContainer.querySelectorAll(".numInput.cur-year");
            yearElements.forEach(el => {
              el.style.cursor = "pointer";
              el.addEventListener("click", () => {
                const year = parseInt(el.value);
                if (!isNaN(year)) {
                  const newDate = new Date(year, 0, 1);
                  this._dateVal = newDate;
                  this._secondDateVal = new Date(year, 11, 31);
                  this.fp.setDate(newDate, true);
                  this.fp.close();
                  this.fireChanged();
                }
              });
            });
          }, 100);
        } else if (this._selectMode === "month") {
          setTimeout(() => {
            const monthButtons = instance.calendarContainer.querySelectorAll(".flatpickr-monthSelect-month");
            monthButtons.forEach((btn, index) => {
              btn.style.cursor = "pointer";
              btn.addEventListener("click", () => {
                const year = instance.currentYear;
                const month = index;
                const newDate = new Date(year, month, 1);
                this._dateVal = newDate;
                this._secondDateVal = new Date(year, month + 1, 0);
                this.fp.setDate(newDate, true);
                this.fp.close();
                this.fireChanged();
              });
            });
          }, 100);
        }
      }
    };

    if (this._selectMode === "month" && this.monthSelectPlugin) {
      config.dateFormat = "Y-m";
      config.altInput = true;
      config.altFormat = "F Y";
      config.plugins = [
        this.monthSelectPlugin({
          shorthand: false,
          dateFormat: "Y-m",
          altFormat: "F Y",
          theme: "light"
        })
      ];
    } else if (this._selectMode === "year") {
      config.dateFormat = "Y";
      config.altInput = true;
      config.altFormat = "Y";
      config.allowInput = false;
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
    const parsed = new Date(value);
    if (parsed instanceof Date && !isNaN(parsed)) {
      this._dateVal = parsed;
      if (this.fp) this.fp.setDate(this._dateVal);
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
}

customElements.define("custom-flatpickr-datepicker", CustomFlatpickrDatePicker);
