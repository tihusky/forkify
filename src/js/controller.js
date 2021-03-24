// Vendor modules
import 'core-js/stable'; // Polyfills
import 'regenerator-runtime/runtime'; // Polyfills for async / await

// Own modules
import { MODAL_HIDE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import editorView from './views/editorView.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // 1) Mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 2) Load recipe
    await model.loadRecipe(id);

    // 3) Render recipe
    recipeView.render(model.state.recipe);

    // 4) Update bookmarks panel
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError(err.message);
  }
};

const controlSearchResults = async function () {
  try {
    // 1) Get search query
    const query = searchView.getQuery();

    if (!query) return;

    resultsView.renderSpinner();

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError(err.message);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1) Update recipe object
  model.updateServings(newServings);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  // 1) Add / remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks panel
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarksRender = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlRecipeUpload = async function (data) {
  try {
    editorView.renderSpinner();

    // 1) Send recipe data to the API
    await model.uploadRecipe(data);

    // 2) Render success message
    editorView.renderMessage();

    // 3) Hide editor window automatically
    setTimeout(editorView.toggleWindow.bind(editorView), MODAL_HIDE_SEC * 1000);

    // 4) Update bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 5) Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 6) Show the uploaded recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    editorView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarksRender);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlBookmarks);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  editorView.addHandlerSubmit(controlRecipeUpload);
};

init();

if (module.hot) module.hot.accept();
