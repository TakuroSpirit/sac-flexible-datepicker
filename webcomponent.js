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
        <label style="font-weight:bold; display:block; margin-bottom: 4px;">Filtern auf:</label>
        <label><input type="radio" name="mode" value="day" ${this._selectMode === "day" ? "checked" : ""}/> Tag</label>
        <label><input type="radio" name="mode" value="month" ${this._selectMode === "month" ? "checked" : ""}/> Monat</label>
        <label><input type="radio" name="mode" value="year" ${this._selectMode === "year" ? "checked" : ""}/> Jahr</label>
      </div>
      <div id="custom-input"></div>
    `;

    this.shadowRoot.querySelectorAll("input[name='mode']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.selectMode = e.target.value;
      });
    });

    this.renderCustomInput();
  }

  async renderCustomInput() {
    const container = this.shadowRoot.getElementById("custom-input");
    container.innerHTML = "";

    if (this.fp) {
      this.fp.destroy();
      this.fp = null;
    }

    if (this._selectMode === "day") {
      const input = document.createElement("input");
      input.style.padding = "6px";
      input.style.width = "100%";
      input.id = "picker";
      container.appendChild(input);

      if (!window.flatpickr) {
        await import("https://cdn.jsdelivr.net/npm/flatpickr");
      }

      this.fp = flatpickr(input, {
        dateFormat: "d.m.Y",
        defaultDate: this._dateVal,
        onChange: (selectedDates) => {
          const d = selectedDates[0];
          if (!(d instanceof Date) || isNaN(d)) return;
          this._dateVal = d;
          this._secondDateVal = null;
          this.fireChanged();
        }
      });

      if (this._dateVal) {
        this.fp.setDate(this._dateVal, true);
      }

    } else if (this._selectMode === "month") {
      const select = document.createElement("select");
      select.style.width = "100%";
      select.style.padding = "12px";
      const currentYear = (this._dateVal || new Date()).getFullYear();
      const currentMonth = (this._dateVal || new Date()).getMonth();
      for (let m = 0; m < 12; m++) {
        const option = document.createElement("option");
        const date = new Date(currentYear, m, 1);
        option.value = `${currentYear}-${m + 1}`;
        option.textContent = date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
        if (m === currentMonth) option.selected = true;
        select.appendChild(option);
      }
      select.addEventListener("change", () => {
        const [year, month] = select.value.split("-").map(Number);
        this._dateVal = new Date(year, month - 1, 1);
        this._secondDateVal = new Date(year, month, 0);
        this.fireChanged();
      });
      container.appendChild(select);

    } else if (this._selectMode === "year") {
      const select = document.createElement("select");
      select.style.width = "100%";
      select.style.padding = "12px";
      const currentYear = (this._dateVal || new Date()).getFullYear();
      for (let i = -7; i <= 2; i++) {
        const y = currentYear + i;
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        if (y === currentYear) option.selected = true;
        select.appendChild(option);
      }
      select.addEventListener("change", () => {
        const year = parseInt(select.value);
        if (!isNaN(year)) {
          this._dateVal = new Date(year, 0, 1);
          this._secondDateVal = new Date(year, 11, 31);
          this.fireChanged();
        }
      });
      container.appendChild(select);
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

  getMode() {
    return this._selectMode === "day" ? "D" : this._selectMode === "month" ? "M" : "Y";
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
