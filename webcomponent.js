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
    this.render();
  }

  render() {
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = this._darktheme
      ? "https://cdn.jsdelivr.net/npm/flatpickr/dist/themes/dark.css"
      : "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/flatpickr";
    script.onload = () => this.initFlatpickr();

    const input = document.createElement("input");
    input.id = "picker";
    input.style.padding = "6px";
    input.style.width = "100%";

    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(cssLink);
    this.shadowRoot.appendChild(input);
    this.shadowRoot.appendChild(script);
  }

  initFlatpickr() {
    const input = this.shadowRoot.getElementById("picker");
    if (!input) return;

    const config = {
      dateFormat: "Y-m-d",
      mode: this._selectMode === "day" ? "single" : "range",
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

  // SAC property setters
  set selectMode(value) {
    this._selectMode = value;
    if (this.fp) this.fp.destroy();
    this.initFlatpickr();
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
