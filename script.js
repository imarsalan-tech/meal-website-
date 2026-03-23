const API = "https://www.themealdb.com/api/json/v1/1/";

window.onload = () => {
  getRandom();
  getPopularIngredients();
  getRandomIngredients();
  getFlags();
  createLetters();
};

// Helper function that was missing
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function searchMeals() {
  const query = document.getElementById("searchInput").value;
  if (!query) return; // Don't search if input is empty
  
  const res = await fetch(`${API}search.php?s=${query}`);
  const data = await res.json();
  
  document.getElementById("results").innerHTML = "<h2>Search Results</h2>";
  displayMeals(data.meals, "results");
}

async function getRandom() {
  let meals = [];
  // Using Promise.all makes loading 6 random meals much faster
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(fetch(`${API}random.php`).then(res => res.json()));
  }
  
  const results = await Promise.all(promises);
  results.forEach(data => meals.push(data.meals[0]));

  displayMeals(meals, "random");
}

function displayMeals(meals, containerId) {
  const container = document.getElementById(containerId);
  
  // Handle empty search results so the app doesn't crash
  if (!meals) {
    container.innerHTML += "<p>No meals found. Try another search!</p>";
    return;
  }

  // If it's not the results container, clear it first
  if (containerId !== "results") {
    container.innerHTML = "";
  }

  meals.forEach(meal => {
    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <img src="${meal.strMealThumb}">
      <h4>${meal.strMeal}</h4>
    `;

    div.onclick = () => showDetail(meal);
    container.appendChild(div);
  });
}

function showDetail(meal) {
  const modal = document.getElementById("mealDetail");
  const info = document.getElementById("mealInfo");

  let ingredients = "";
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
    }
  }

  info.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" width="300" style="border-radius:10px;">
    <h3>Ingredients</h3>
    <ul style="text-align: left;">${ingredients}</ul>
    <h3>Instructions</h3>
    <p style="text-align: left; line-height: 1.5;">${meal.strInstructions}</p>
  `;

  modal.classList.remove("hidden");
}

async function getPopularIngredients() {
  const popular = ["chicken", "salmon", "beef", "pork"];
  const container = document.getElementById("popularIngredients");

  popular.forEach(name => {
    container.innerHTML += `
      <div class="ingredient-card" onclick="filterByIngredient('${name}')">
        <img src="https://www.themealdb.com/images/ingredients/${name}.png" width="100">
        <p>${capitalize(name)}</p>
      </div>
    `;
  });
}

async function getRandomIngredients() {
  const res = await fetch(API + "list.php?i=list");
  const data = await res.json();

  const shuffled = data.meals.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);

  const container = document.getElementById("randomIngredients");

  selected.forEach(i => {
    const name = i.strIngredient;
    container.innerHTML += `
      <div class="ingredient-card" onclick="filterByIngredient('${name}')">
        <img src="https://www.themealdb.com/images/ingredients/${name}.png" width="100">
        <p>${name}</p>
      </div>
    `;
  });
}

async function filterByIngredient(ingredient) {
  const res = await fetch(API + "filter.php?i=" + ingredient);
  const data = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = `<h2>Meals with ${ingredient}</h2>`;
  displayMeals(data.meals, "results");
  
  // Scroll to results
  container.scrollIntoView({ behavior: 'smooth' });
}

const countries = ["Italian","American","British","Canadian","Chinese","French","Indian"];

async function getFlags() {
  const container = document.getElementById("flags");

  countries.forEach(c => {
    container.innerHTML += `
      <img src="https://flagsapi.com/${getCode(c)}/flat/64.png" class="flag-icon" onclick="filterByCountry('${c}')" title="${c}">
    `;
  });
}

function getCode(country) {
  const map = {
    Italian: "IT", American: "US", British: "GB",
    Canadian: "CA", Chinese: "CN", French: "FR", Indian: "IN"
  };
  return map[country];
}

async function filterByCountry(country) {
  const res = await fetch(API + "filter.php?a=" + country);
  const data = await res.json();
  
  const container = document.getElementById("results");
  container.innerHTML = `<h2>${country} Food</h2>`;
  displayMeals(data.meals, "results");
  container.scrollIntoView({ behavior: 'smooth' });
}

async function createLetters() {
  const container = document.getElementById("letters");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  alphabet.split("").forEach(l => {
    container.innerHTML += `<span class="letter" onclick="filterByLetter('${l}')">${l}</span>`;
  });
}

async function filterByLetter(letter) {
  const res = await fetch(API + "search.php?f=" + letter);
  const data = await res.json();
  
  const container = document.getElementById("results");
  container.innerHTML = `<h2>Meals starting with ${letter}</h2>`;
  displayMeals(data.meals, "results");
  container.scrollIntoView({ behavior: 'smooth' });
}

function closeModal() {
  document.getElementById("mealDetail").classList.add("hidden");
}

function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}