export const searchUSDA = async (foodName) => {
  const apiKey = process.env.REACT_APP_USDA_API_KEY;
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?query=${foodName}&api_key=${apiKey}&pageSize=1`
  );
  const data = await response.json();

  if (data.foods && data.foods.length > 0) {
    const food = data.foods[0];
    const nutrients = food.foodNutrients;

    const getVal = (name) => {
      const n = nutrients.find(n => n.nutrientName === name);
      return n ? Math.round(n.value) : 0;
    };

    return {
      name: food.description,
      calories: getVal('Energy'),
      protein: getVal('Protein'),
      carbs: getVal('Carbohydrate, by difference'),
      fats: getVal('Total lipid (fat)'),
      fiber: getVal('Fiber, total dietary'),
      verified: true
    };
  }
  return null;
};