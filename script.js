let ingredientCounter = 1;

function addIngredient() {
    ingredientCounter++;
    const ingredientsDiv = document.getElementById('ingredients');
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('ingredient');
    newIngredient.id = `ingredient-${ingredientCounter}`;
    newIngredient.innerHTML = `
        <div class="input-group">
            <input type="text" id="ingredient-name-${ingredientCounter}" name="ingredient-name-${ingredientCounter}" placeholder="Ingredient Name">
            <span class="error-message ingredient-name-error"></span>
        </div>
        <div class="input-group">
            <input type="number" id="ingredient-quantity-${ingredientCounter}" name="ingredient-quantity-${ingredientCounter}" placeholder="Quantity">
            <span class="error-message ingredient-quantity-error"></span>
        </div>
        <div class="input-group">
            <select id="ingredient-unit-${ingredientCounter}" name="ingredient-unit-${ingredientCounter}">
                <option value="ounces">Ounces</option>
                <option value="milliliters">Milliliters</option>
            </select>
            <span class="error-message ingredient-unit-error"></span>
        </div>
        <button type="button" class="remove-ingredient" onclick="removeIngredient('ingredient-${ingredientCounter}')">×</button>
    `;
    ingredientsDiv.appendChild(newIngredient);
}

function removeIngredient(id) {
    const ingredient = document.getElementById(id);
    ingredient.parentNode.removeChild(ingredient);
}

function calculateRecipe() {
    // Clear previous error messages
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

    let waterVolume = totalIngredientVolume * dilution;
    let totalVolume;

    if (numServings) {
        totalVolume = (totalIngredientVolume + waterVolume) * numServings;
    } else if (totalVolumeInput) {
        if (totalVolumeUnit === 'liters') {
            totalVolume = totalVolumeInput * 1000; // Convert liters to milliliters
        } else {
            totalVolume = totalVolumeInput;
        }
    } else {
        document.getElementById('calculate-error').innerText = 'Please enter either the number of servings or the total volume.';
        return;
    }

    if (totalVolume < totalIngredientVolume + waterVolume) {
        document.getElementById('calculate-error').innerText = 'Total volume is less than the volume of ingredients plus dilution. Please increase the total volume.';
        return;
    }

    let scaledRecipe = '<ul>';
    const scalingFactor = totalVolume / (totalIngredientVolume + waterVolume);

    ingredientVolumes.forEach(ingredient => {
        let scaledQuantity = ingredient.volumeInMilliliters * scalingFactor;
        scaledRecipe += `<li>${ingredient.name}: ${convertFromMilliliters(scaledQuantity, inputUnit).toFixed(2)} ${inputUnit}</li>`;
    });

    if (waterVolume > 0) {
        let scaledWaterVolume = waterVolume * scalingFactor;
        scaledRecipe += `<li>Water: ${convertFromMilliliters(scaledWaterVolume, inputUnit).toFixed(2)} ${inputUnit}</li>`;
    }

    scaledRecipe += '</ul>';
    document.getElementById('scaled-recipe').innerHTML = scaledRecipe;

    // Show the output section
    document.getElementById('output').style.display = 'block';
}

function convertToMilliliters(quantity, unit) {
    const conversionRates = {
        ounces: 29.5735,
        milliliters: 1,
        liters: 1000
    };
    return quantity * conversionRates[unit];
}

function convertFromMilliliters(quantity, unit) {
    const conversionRates = {
        ounces: 1 / 29.5735,
        milliliters: 1,
        liters: 1 / 1000
    };
    return quantity * conversionRates[unit];
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.innerText = '';
    });
}
