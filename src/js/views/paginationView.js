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

    // 1) On page 1 and there are other pages
    if (curPage === 1 && numPages > 1) {
      return generateMarkupButton('next');
    }

    // 2) On the last page
    if (curPage === numPages && numPages > 1) {
      return generateMarkupButton('prev');
    }

    // 3) On any other page
    if (curPage !== 1 && curPage < numPages) {
      return generateMarkupButton('prev') + generateMarkupButton('next');
    }

    // 4) Only one page
    return '';
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
