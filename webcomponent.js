// webcomponent.js
class CustomFlatpickrDatePicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectMode = "day";
    this._darktheme = false;
    this._dateVal = new Date();
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
      input.style.height = "36px"
      input.style.width = "calc(100% - 12px)";
      input.style.border = "1px solid #ccc";
      input.style.borderRadius = "8px";
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
      select.style.height = "44px"
      select.style.padding = "6px";
      select.style.border = "1px solid #ccc";
      select.style.borderRadius = "8px";
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
      select.style.padding = "6px";
      select.style.height = "44px"
      select.style.border = "1px solid #ccc";
      select.style.borderRadius = "8px";
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

  renderQuickButtons() {
    const quick = this.shadowRoot.getElementById("quick-buttons");
    quick.innerHTML = "";
    const buttons = [
      { label: "Gestern", mode: "day", offset: -1, type: "day" },
      { label: "Heute", mode: "day", offset: 0, type: "day" },
      { label: "Morgen", mode: "day", offset: 1, type: "day" },
      { label: "Letzter Monat", mode: "month", offset: -1, type: "month" },
      { label: "Aktueller Monat", mode: "month", offset: 0, type: "month" },
      { label: "Nächster Monat", mode: "month", offset: 1, type: "month" },
      { label: "Letztes Jahr", mode: "year", offset: -1, type: "year" },
      { label: "Aktuelles Jahr", mode: "year", offset: 0, type: "year" },
      { label: "Nächstes Jahr", mode: "year", offset: 1, type: "year" },
    ];

    buttons.forEach(b => {
      const btn = document.createElement("button");
      btn.textContent = b.label;
      btn.style.padding = "6px";
      btn.style.borderRadius = "6px";
      btn.style.border = "1px solid #ccc";
      btn.style.background = "#f9f9f9";
      btn.style.cursor = "pointer";
      btn.style.height = "36px"; // Einheitliche Höhe
      btn.style.display = "flex"; 
      btn.style.alignItems = "center"; 
      btn.style.justifyContent = "center";

      btn.addEventListener("click", () => {
        this._selectMode = b.mode;
        if (b.type === "day") {
          const d = new Date();
          d.setDate(d.getDate() + b.offset);
          this._dateVal = d;
          this._secondDateVal = null;
        } else if (b.type === "month") {
          const d = new Date();
          d.setMonth(d.getMonth() + b.offset);
          this._dateVal = new Date(d.getFullYear(), d.getMonth(), 1);
          this._secondDateVal = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        } else if (b.type === "year") {
          const d = new Date();
          d.setFullYear(d.getFullYear() + b.offset);
          this._dateVal = new Date(d.getFullYear(), 0, 1);
          this._secondDateVal = new Date(d.getFullYear(), 11, 31);
        }
        this.render();
        this.fireChanged();
      });
      quick.appendChild(btn);
    });
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
    if (!value) {
      this._dateVal = null;
      return;
    }
    const parsed = new Date(value);
    if (parsed instanceof Date && !isNaN(parsed)) {
      this._dateVal = parsed;
      if (this.fp) this.fp.setDate(this._dateVal, true);
    }
  }

  set secondDateVal(value) {
    if (!value) {
      this._secondDateVal = null;
      return;
    }
    const parsed = new Date(value);
    if (parsed instanceof Date && !isNaN(parsed)) {
      this._secondDateVal = parsed;
    }
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
