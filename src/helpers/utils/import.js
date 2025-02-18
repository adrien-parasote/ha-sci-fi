export const defineCustomElement = function (name, element) {
  window.customElements.get(name) ||
    window.customElements.define(name, element);
};

export const defineCustomCard = function (type, name, description) {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: type,
    name: name,
    description: description,
  });
};
