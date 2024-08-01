let ingredientCounter = 1;

function addIngredient() {
    ingredientCounter++;
    const ingredientsDiv = document.getElementById('ingredients');
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('ingredient');
    newIngredient.id = `ingredient-${ingredientCounter}`;
    newIngredient.innerHTML = `
        <div class="input-group">
            <div>
                <label for="ingredient-name-${ingredientCounter}">Ingredient Name:</label>
                <input type="text" class="ingredient-name" id="ingredient-name-${ingredientCounter}" name="ingredient-name-${ingredientCounter}" placeholder="E.g., Rye">
                <span class="error-message ingredient-name-error"></span>
            </div>
            <div>
                <label for="ingredient-quantity-${ingredientCounter}">Quantity:</label>
                <input type="number" class="ingredient-quantity" id="ingredient-quantity-${ingredientCounter}" name="ingredient-quantity-${ingredientCounter}" placeholder="E.g., 2">
                <span class="error-message ingredient-quantity-error"></span>
            </div>
            <div>
                <label for="ingredient-unit-${ingredientCounter}">Unit:</label>
                <select class="ingredient-unit" id="ingredient-unit-${ingredientCounter}" name="ingredient-unit-${ingredientCounter}">
                    <option value="ounces">Ounces</option>
                    <option value="milliliters">Milliliters</option>
                </select>
                <span class="error-message ingredient-unit-error"></span>
            </div>
            <button type="button" class="remove-ingredient" onclick="removeIngredient('ingredient-${ingredientCounter}')">×</button>
        </div>
    `;
    ingredientsDiv.appendChild(newIngredient);
}

function removeIngredient(id) {
    const ingredient = document.getElementById(id);
    ingredient.parentNode.removeChild(ingredient);
}

function clearErrorMessages() {
    const errorMessages = document.getElementsByClassName('error-message');
    for (let i = 0; i < errorMessages.length; i++) {
        errorMessages[i].innerText = '';
    }
}

function convertToMilliliters(quantity, unit) {
    if (unit === 'ounces') {
        return quantity * 29.5735; // Convert ounces to milliliters
    }
    return quantity; // Assume milliliters if the unit is not ounces
}

function convertFromMilliliters(volume, unit) {
    if (unit === 'ounces') {
        return volume / 29.5735; // Convert milliliters to ounces
    }
    return volume; // Assume milliliters if the unit is not ounces
}

function calculateRecipe() {
    clearErrorMessages();

    const recipeName = document.getElementById('recipe-name').value;
    const numServings = parseFloat(document.getElementById('num-servings').value);
    const totalVolumeInput = parseFloat(document.getElementById('total-volume').value);
    const totalVolumeUnit = document.getElementById('total-volume-unit').value;
    const dilution = parseFloat(document.getElementById('dilution').value) / 100;

    const ingredientsDiv = document.getElementById('ingredients');
    const ingredients = ingredientsDiv.getElementsByClassName('ingredient');

    let totalIngredientVolume = 0;
    let ingredientVolumes = [];
    let originalRecipe = '<ul>';
    let inputUnit = '';
    let hasError = false;

    if (!recipeName) {
        document.getElementById('recipe-name-error').innerText = 'Recipe name is required.';
        hasError = true;
    }

    for (let i = 0; i < ingredients.length; i++) {
        const name = ingredients[i].querySelector(`[name="ingredient-name-${i + 1}"]`).value;
        const quantity = parseFloat(ingredients[i].querySelector(`[name="ingredient-quantity-${i + 1}"]`).value) || 0;
        const unit = ingredients[i].querySelector(`[name="ingredient-unit-${i + 1}"]`).value;

        if (inputUnit === '') {
            inputUnit = unit;
        }

        if (!name) {
            ingredients[i].querySelector('.ingredient-name-error').innerText = 'Ingredient name is required.';
            hasError = true;
        }

        if (quantity <= 0) {
            ingredients[i].querySelector('.ingredient-quantity-error').innerText = 'Quantity must be greater than zero.';
            hasError = true;
        }

        originalRecipe += `<li>${name}: ${quantity} ${unit}</li>`;

        let volumeInMilliliters = convertToMilliliters(quantity, unit);
        totalIngredientVolume += volumeInMilliliters;
        ingredientVolumes.push({ name, volumeInMilliliters });
    }

    if (hasError) {
        return;
    }

    originalRecipe += '</ul>';
    document.getElementById('original-recipe').innerHTML = originalRecipe;
    document.getElementById('output-recipe-name').innerText = recipeName;

    let totalVolume = 0;
    if (numServings) {
        totalVolume = (totalIngredientVolume / ingredientVolumes.length) * numServings;
    } else if (totalVolumeInput) {
        totalVolume = convertToMilliliters(totalVolumeInput, totalVolumeUnit);
    }

    let waterVolume = totalVolume * dilution;
    let scaledRecipe = '<ul>';
    let totalScaledVolume = 0;

    for (let i = 0; i < ingredientVolumes.length; i++) {
        let scaledVolume = (ingredientVolumes[i].volumeInMilliliters / totalIngredientVolume) * (totalVolume - waterVolume);
        totalScaledVolume += scaledVolume;
        scaledRecipe += `<li>${ingredientVolumes[i].name}: ${convertFromMilliliters(scaledVolume, inputUnit).toFixed(2)} ${inputUnit}</li>`;
    }

    scaledRecipe += `<li>Water: ${convertFromMilliliters(waterVolume, inputUnit).toFixed(2)} ${inputUnit}</li>`;
    scaledRecipe += '</ul>';

    document.getElementById('scaled-recipe').innerHTML = scaledRecipe;
    document.getElementById('output').style.display = 'block';
}
