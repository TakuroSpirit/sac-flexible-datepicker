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
    const config = {
      dateFormat: "Y-m-d",
      onChange: this.onChange.bind(this),
    };

    if (this._selectMode === "month") {
      config.plugins = [
        new window.flatpickr.l10ns.default.monthSelectPlugin({
          shorthand: true,
          dateFormat: "Y-m",
          altFormat: "F Y"
        })
      ];
    } else if (this._selectMode === "year") {
      config.plugins = [
        {
          shorthand: true,
          onReady: (selectedDates, dateStr, instance) => {
            instance.currentYearElement.type = "number";
            instance.currentYearElement.step = 1;
            instance.daysContainer.style.display = "none";
          },
          onChange: (selectedDates, dateStr) => {
            const year = selectedDates[0].getFullYear();
            const start = new Date(year, 0, 1);
            const end = new Date(year, 11, 31);
            this._dateVal = start;
            this._secondDateVal = end;
            this.fireChanged();
          }
        }
      ];
    }

    this.fp = window.flatpickr(this.shadowRoot.getElementById("picker"), config);
  }

  onChange(selectedDates) {
    this._dateVal = selectedDates[0];
    this._secondDateVal = selectedDates[1] || null;
    this.fireChanged();
  }

  fireChanged() {
    this.dispatchEvent(
      new CustomEvent("onChange", {
        detail: {
          dateVal: this._dateVal,
          secondDateVal: this._secondDateVal,
          selectMode: this._selectMode,
        },
      })
    );
  }

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