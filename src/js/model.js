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

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    state.recipe.bookmarked = state.bookmarks.some(bm => bm.id === id);
  } catch (err) {
    throw err;
  }
};

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

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  // newQt = oldQt / oldServings * newServings
  state.recipe.ingredients.forEach(
    ing => (ing.quantity = (ing.quantity / state.recipe.servings) * newServings)
  );

  state.recipe.servings = newServings;
};

const saveBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  // 1) Mark current recipe as bookmarked
  if (state.recipe.id === recipe.id) state.recipe.bookmarked = true;

  // 2) Save bookmarks to local storage
  saveBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(bm => bm.id === id);

  // 1) Remove bookmark if it exists
  if (index !== -1) state.bookmarks.splice(index, 1);

  // 2) Mark current recipe as not bookmarked
  if (state.recipe.id === id) state.recipe.bookmarked = false;

  // 3) Save bookmarks to local storage
  saveBookmarks();
};

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

const init = function () {
  state.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) ?? [];
};

init();
