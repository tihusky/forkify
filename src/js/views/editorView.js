import View from './View.js';

class EditorView extends View {
  _parentElement = document.querySelector('.upload');
  _successMessage = 'Recipe uploaded successfully!';
  _numIngredients = 1;

  _overlay = document.querySelector('.overlay');
  _editorWindow = document.querySelector('.add-recipe-window');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _btnAddIng = document.querySelector('.btn--add-ingredient');

  constructor() {
    super();

    [this._overlay, this._btnOpen, this._btnClose].forEach(el => {
      el.addEventListener('click', this.toggleWindow.bind(this));
    });

    this._btnAddIng.addEventListener(
      'click',
      this._addIngredientRow.bind(this)
    );
  }

  _addIngredientRow(e) {
    e.preventDefault();

    this._numIngredients++;

    const markup = `
      <div class="upload__ingredients-row">
        <input type="number" name="quantity" placeholder="Quantity" />
        <select name="unit">
              <option value="">-- Unit --</option>
              <option value="">(n/a)</option>
              <option value="ml">Milliliter</option>
              <option value="l">Liter</option>
              <option value="g">Gram</option>
              <option value="kg">Kilogram</option>
              <option value="tbsp">Tablespoon</option>
              <option value="tsp">Teaspoon</option>
              <option value="c">Cup</option>
              <option value="oz">Ounce</option>
              <option value="lb">Pound</option>
            </select>
        <input type="text" name="description" placeholder="Description" />
      </div>
    `;

    this._btnAddIng.insertAdjacentHTML('beforebegin', markup);
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._editorWindow.classList.toggle('hidden');
  }

  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();

      handler(new FormData(this));
    });
  }
}

export default new EditorView();
