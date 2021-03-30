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

/**
 * Loads a recipe from the API and renders it.
 */
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

/**
 * Sends a search query to the API and renders the results.
 */
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

/**
 * Renders the requested page of search results and updates the pagination.
 *
 * @param {number} goToPage The page of search results to be rendered.
 */
const controlPagination = function (goToPage) {
  // 1) Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render new pagination buttons
  paginationView.render(model.state.search);
};

/**
 * Updates the number of servings for the currently shown recipe.
 *
 * @param {number} newServings The new amount of servings.
 */
const controlServings = function (newServings) {
  // 1) Update recipe object
  model.updateServings(newServings);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);
};

/**
 * Toggles the bookmarked state for the currently shown recipe and updates the UI.
 */
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

/**
 * Renders the bookmark panel.
 */
const controlBookmarksRender = function () {
  bookmarksView.render(model.state.bookmarks);
};

/**
 * Sends recipe data to the API and updates the UI as well as the URL.
 *
 * The data object must have the properties "ingredient-1" ... "ingredient-6" with
 * their values being in the format "quantity,unit,description".
 *
 * Newly submitted recipes are bookmarked by default and then shown in
 * the recipe view.
 *
 * @param {object} data An object containing recipe data.
 * @param {string} data.title - The name of the recipe.
 * @param {string} data.publisher - The author of the recipe.
 * @param {string} data.sourceUrl - The URL of the website providing the recipe.
 * @param {string} data.image - The URL of the recipe image.
 * @param {number} data.servings - The default number of servings.
 * @param {number} data.cookingTime - The preparation time in minutes.
 */
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

/**
 * Initializes event handlers.
 */
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
