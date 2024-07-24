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
    const numServings = document.getElementById('num-servings').value;
    const totalVolume = document.getElementById('total-volume').value;
    const includeDilution = document.getElementById('dilution').checked;
    
    const ingredientsDiv = document.getElementById('ingredients');
    const ingredients = ingredientsDiv.getElementsByClassName('ingredient');

    let scaledRecipe = '<h3>Scaled Recipe:</h3><ul>';

    for (let i = 0; i < ingredients.length; i++) {
        const name = ingredients[i].querySelector(`[name="ingredient-name-${i + 1}"]`).value;
        const quantity = parseFloat(ingredients[i].querySelector(`[name="ingredient-quantity-${i + 1}"]`).value);
        const unit = ingredients[i].querySelector(`[name="ingredient-unit-${i + 1}"]`).value;

        let scaledQuantity;

        if (numServings) {
            scaledQuantity = quantity * numServings; // Simple scaling logic for demonstration
        } else if (totalVolume) {
            // Add logic to scale by total volume if needed
        }

        // Adjust for dilution if necessary (placeholder logic)
        if (includeDilution) {
            scaledQuantity *= 1.2; // Assuming a 20% dilution
        }

        scaledRecipe += `<li>${name}: ${scaledQuantity.toFixed(2)} ${unit}</li>`;
    }

    scaledRecipe += '</ul>';
    document.getElementById('scaled-recipe').innerHTML = scaledRecipe;
});

document.getElementById('print-recipe').addEventListener('click', function() {
    window.print();
});
