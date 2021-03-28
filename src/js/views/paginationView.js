// Own modules
import View from './View.js';

// Assets
import icons from 'url:../../img/icons.svg';

class Pagination extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkup() {
    // direction: 'prev' or 'next'
    const generateMarkupButton = function (direction) {
      if (direction === 'prev') {
        return `
          <button class="btn--inline pagination__btn--prev" data-goto="${
            curPage - 1
          }">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
          </button>
        `;
      }

      if (direction === 'next') {
        return `
          <button class="btn--inline pagination__btn--next" data-goto="${
            curPage + 1
          }">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>
        `;
      }
    };

    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // 0) No pagination if only one page
    if (numPages === 1) return '';

    return `
      <button class="btn--inline pagination__btn--prev ${
        curPage === 1 ? 'hidden' : ''
      }" data-goto="${curPage - 1}">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>Page ${curPage - 1}</span>
      </button>

      <span class="pagination__pages">Page ${curPage} of ${numPages}</span>

      <button class="btn--inline pagination__btn--next ${
        curPage === numPages ? 'hidden' : ''
      }" data-goto="${curPage + 1}">
        <span>Page ${curPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
    `;
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = Number(btn.dataset.goto);
      handler(goToPage);
    });
  }
}

export default new Pagination();
