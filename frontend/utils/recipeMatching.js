// Finds TheMealDB recipes you can make with what's in your pantry.
//
// How it works: TheMealDB lets you download recipes by first letter, and those
// results include each recipe's full ingredient list. We download all 26 letters
// once (cached while the app is open), then compare every recipe's ingredients
// with your pantry.

// Things we assume everyone has, so they never count as "missing".
// Add or remove items here to change how strict the matching is.
const STAPLES = [
  "salt",
  "black pepper",
  "pepper",
  "water",
  "oil",
  "olive oil",
  "vegetable oil",
  "sunflower oil",
  "extra virgin olive oil",
];

// US pantry name -> names TheMealDB (mostly British recipes) uses instead.
const SYNONYMS = {
  "bell pepper": ["red pepper", "green pepper", "yellow pepper", "orange pepper"],
  "cilantro": ["coriander", "coriander leaf", "fresh coriander"],
  "scallion": ["spring onion"],
  "green onion": ["spring onion"],
  "zucchini": ["courgette"],
  "eggplant": ["aubergine"],
  "shrimp": ["prawn", "king prawn", "tiger prawn"],
  "ground beef": ["minced beef", "beef mince"],
  "ground pork": ["minced pork"],
  "heavy cream": ["double cream"],
  "all purpose flour": ["plain flour"],
};

// "Bell Peppers" -> "bell pepper", "tomatoes" -> "tomato", "berries" -> "berry"
function normalize(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
      if (word.endsWith("oes") && word.length > 4) return word.slice(0, -2);
      if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) return word.slice(0, -1);
      return word;
    })
    .join(" ");
}

// True if `phrase` appears as whole words inside `text`.
// "chicken" is in "chicken breast", but "egg" is not in "eggplant".
function containsWords(text, phrase) {
  return ` ${text} `.includes(` ${phrase} `);
}

const STAPLE_SET = STAPLES.map(normalize);
const NORMALIZED_SYNONYMS = Object.fromEntries(
  Object.entries(SYNONYMS).map(([key, list]) => [normalize(key), list.map(normalize)])
);

function isStaple(ingredient) {
  return STAPLE_SET.includes(ingredient);
}

// Does a pantry item cover a recipe ingredient?
function pantryCovers(pantryItem, ingredient) {
  if (containsWords(ingredient, pantryItem)) return true;
  const alternatives = NORMALIZED_SYNONYMS[pantryItem] || [];
  return alternatives.some((alt) => containsWords(ingredient, alt));
}

// A meal object from TheMealDB has strIngredient1 ... strIngredient20.
function getIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const value = (meal[`strIngredient${i}`] || "").trim();
    if (value) list.push(value);
  }
  return list;
}

let allMealsCache = null;

async function loadAllMeals() {
  if (allMealsCache) return allMealsCache;
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const results = await Promise.all(
    letters.map(async (letter) => {
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
        );
        const data = await res.json();
        return data.meals || [];
      } catch (error) {
        console.error(`Couldn't load recipes starting with "${letter}":`, error);
        return [];
      }
    })
  );
  allMealsCache = results.flat();
  return allMealsCache;
}

// pantryNames: e.g. ["chicken", "Bell Peppers", "eggs"]
// Returns recipes that use at least one pantry item, each with:
//   have:    recipe ingredients you have (in the recipe's own words)
//   missing: recipe ingredients you don't have (staples not counted)
// sorted so recipes you can fully make come first.
export async function findRecipes(pantryNames) {
  const pantry = pantryNames.map(normalize).filter(Boolean);
  if (pantry.length === 0) return [];

  const meals = await loadAllMeals();
  const matches = [];

  for (const meal of meals) {
    const have = [];
    const missing = [];
    for (const ingredient of getIngredients(meal)) {
      const norm = normalize(ingredient);
      if (pantry.some((item) => pantryCovers(item, norm))) {
        have.push(ingredient);
      } else if (!isStaple(norm)) {
        missing.push(ingredient);
      }
    }
    if (have.length > 0) {
      matches.push({ ...meal, have, missing });
    }
  }

  // Fewest missing first; if tied, the one using more of your pantry first.
  matches.sort(
    (a, b) => a.missing.length - b.missing.length || b.have.length - a.have.length
  );
  return matches;
}