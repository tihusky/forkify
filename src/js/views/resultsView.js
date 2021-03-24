// Own modules
import PreviewView from './PreviewView.js';

class ResultsView extends PreviewView {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query!';
  _successMessage = '';
}

export default new ResultsView();
