// Own modules
import View from './View.js';

// Assets
import icons from 'url:../../img/icons.svg';

export default class PreviewView extends View {
  _parentElement = null;

  _generateMarkup() {
    return this._data.map(this._generateMarkupPreview).join('');
  }

  _generateMarkupPreview(entry) {
    const id = window.location.hash.slice(1);

    return `
      <li class="preview">
        <a class="preview__link ${
          entry.id === id ? 'preview__link--active' : ''
        }" href="#${entry.id}">
          <figure class="preview__fig">
            <img src="${entry.image}" alt="${entry.title}" />
          </figure>
          <div class="preview__data">
            <h4 class="preview__title">${entry.title}</h4>
            <p class="preview__publisher">${entry.publisher}</p>
            <div class="preview__user-generated ${!entry.key ? 'hidden' : ''}">
              <svg>
                <use href="${icons}#icon-user"></use>
              </svg>
            </div>
          </div>
        </a>
      </li>
    `;
  }
}
