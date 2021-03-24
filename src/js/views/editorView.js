import View from './View.js';

class EditorView extends View {
  _parentElement = document.querySelector('.upload');
  _successMessage = 'Recipe uploaded successfully!';

  _overlay = document.querySelector('.overlay');
  _editorWindow = document.querySelector('.add-recipe-window');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();

    [this._overlay, this._btnOpen, this._btnClose].forEach(el => {
      el.addEventListener('click', this.toggleWindow.bind(this));
    });
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._editorWindow.classList.toggle('hidden');
  }

  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(this).entries());
      handler(data);
    });
  }
}

export default new EditorView();
