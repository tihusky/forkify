import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  _clear() {
    this._parentElement.innerHTML = '';
  }

  render(data) {
    if (!data || (Array.isArray(data) && data.length == 0))
      return this.renderError();

    this._data = data;

    // 1) Generate HTML for this view
    const markup = this._generateMarkup();

    // 2) Show view on the page
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;

    // Generate updated HTML
    const newMarkup = this._generateMarkup();
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // Temporary fix for the error when newElements > curElements
    if (newElements.length !== curElements.length) return this.render(data);

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      // Updates changed text
      if (
        !newEl.isEqualNode(curEl) && newEl.firstChild
          ? newEl.firstChild.nodeValue.trim() !== ''
          : false
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Updates changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr => {
          curEl.setAttribute(attr.name, attr.value);
        });
      }
    });
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._successMessage) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
