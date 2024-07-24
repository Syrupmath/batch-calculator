document.getElementById('add-ingredient').addEventListener('click', function() {
    const ingredientsDiv = document.getElementById('ingredients');
    const ingredientCount = ingredientsDiv.children.length + 1;
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('ingredient');
    newIngredient.innerHTML = `
        <label for="ingredient-name-${ingredientCount}">Ingredient Name:</label>
        <input type="text" id="ingredient-name-${ingredientCount}" name="ingredient-name-${ingredientCount}">
        <label for="ingredient-quantity-${ingredientCount}">Quantity:</label>
        <input type="number" id="ingredient-quantity-${ingredientCount}" name="ingredient-quantity-${ingredientCount}">
        <label for="ingredient-unit-${ingredientCount}">Unit:</label>
        <select id="ingredient-unit-${ingredientCount}" name="ingredient-unit-${ingredientCount}">
            <option value="ounces">Ounces</option>
            <option value="milliliters">Milliliters</option>
        </select>
    `;
    ingredientsDiv.appendChild(newIngredient);
});

document.getElementById('calculate').addEventListener('click', function() {
    // Logic to calculate the scaled recipe
    const scaledRecipeDiv = document.getElementById('scaled-recipe');
    // For now, just show a placeholder
    scaledRecipeDiv.innerHTML = '<p>Scaled recipe will be displayed here.</p>';
});

document.getElementById('print-recipe').addEventListener('click', function() {
    window.print();
});
