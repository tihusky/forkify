import { API_URL, API_KEY, RESULTS_PER_PAGE } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

/**
 * Converts a recipe object received from the API to the format that can be used by this
 * application.
 *
 * @param {object} data The received recipe object.
 * @returns {object} A recipe object in the correct format for this application.
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    publisher: recipe.publisher,
    ingredients: recipe.ingredients,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    title: recipe.title,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ...(recipe.key && { key: recipe.key }), // Adds the API key to the object if it exists
  };
};

/**
 * Requests recipe data from the API and stores it in the application state.
 *
 * @param {string} id The id of the recipe to be loaded.
 * @throws Throws a TimeoutError if the request timed out.
 * @throws Throws an error if the request was invalid.
 */
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    state.recipe.bookmarked = state.bookmarks.some(bm => bm.id === id);
  } catch (err) {
    throw err;
  }
};

/**
 * Sends a search query to the API and stores the received results in the application
 * state.
 *
 * @param {string} query The search term which will be sent to the API.
 * @throws Throws a TimeoutError if the request timed out.
 * @throws Throws an error if the request was invalid.
 */
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    state.search.page = 1;

    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    let { recipes } = data.data;

    state.search.results = recipes.map(recipe => {
      return {
        id: recipe.id,
        publisher: recipe.publisher,
        title: recipe.title,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Returns an array of search results that make up the requested results page.
 *
 * @param {number} [page=state.search.page] - The number of the page.
 * @returns An array of recipe objects.
 */
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

/**
 * Calculates the amount of ingredients needed for the new number of servings and
 * updates the application state.
 *
 * @param {number} newServings The new number of servings.
 */
export const updateServings = function (newServings) {
  // newQt = oldQt / oldServings * newServings
  state.recipe.ingredients.forEach(
    ing => (ing.quantity = (ing.quantity / state.recipe.servings) * newServings)
  );

  state.recipe.servings = newServings;
};

/**
 * Saves the current bookmarks to
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage}.
 */
const saveBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

/**
 * Adds the received recipe to the user's bookmarks.
 *
 * @param {object} recipe An object representing the recipe to be bookmarked.
 */
export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  // 1) Mark current recipe as bookmarked
  if (state.recipe.id === recipe.id) state.recipe.bookmarked = true;

  // 2) Save bookmarks to local storage
  saveBookmarks();
};

/**
 * Removes a recipe from the user's bookmarks.
 *
 * @param {string} id ID of the recipe to be removed from the bookmarks.
 */
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bm => bm.id === id);

  // 1) Remove bookmark if it exists
  if (index !== -1) state.bookmarks.splice(index, 1);

  // 2) Mark current recipe as not bookmarked
  if (state.recipe.id === id) state.recipe.bookmarked = false;

  // 3) Save bookmarks to local storage
  saveBookmarks();
};

/**
 * Sends recipe data to the API. On success the API will send back the same recipe
 * which will then be set as the currently active recipe in the application.
 *
 * The recipeData object must have the properties "ingredient-1" ... "ingredient-6" with
 * their values being in the format "quantity,unit,description".
 *
 * @param {object} recipeData An object containing recipe data.
 * @param {string} recipeData.title - The name of the recipe.
 * @param {string} recipeData.publisher - The author of the recipe.
 * @param {string} recipeData.sourceUrl - The URL of the website providing the recipe.
 * @param {string} recipeData.image - The URL of the recipe image.
 * @param {number} recipeData.servings - The default number of servings.
 * @param {number} recipeData.cookingTime - The preparation time in minutes.
 *
 * @throws Will throw an error if the ingredients have the wrong format.
 * @throws Will throw an error if adding the recipe was not successful.
 */
export const uploadRecipe = async function (recipeData) {
  try {
    const ingredients = Object.entries(recipeData)
      .filter(entry => entry[0].includes('ingredient') && entry[1] !== '')
      .map(entry => {
        const ingArr = entry[1].trim().split(',');

        if (ingArr.length !== 3) throw new Error('Wrong ingredient format!');

        const [quantity, unit, description] = ingArr;

        return {
          quantity: quantity ? Number(quantity) : null,
          unit,
          description,
        };
      });

    const recipe = {
      publisher: recipeData.publisher,
      source_url: recipeData.sourceUrl,
      image_url: recipeData.image,
      title: recipeData.title,
      servings: Number(recipeData.servings),
      cooking_time: Number(recipeData.cookingTime),
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);

    // Reject if request was invalid
    if (data.status !== 'success') throw new Error(data.message);

    state.recipe = createRecipeObject(data);

    // Submitted recipes are bookmarked by default
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/**
 * Loads the user's bookmarks and updates the application state.
 */
const init = function () {
  state.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) ?? [];
};

init();
