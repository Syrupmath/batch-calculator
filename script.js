let ingredientCounter = 1;

function addIngredient() {
    ingredientCounter++;
    const ingredientsDiv = document.getElementById('ingredients');
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('row', 'align-items-center', 'mb-3');
    newIngredient.id = `ingredient-${ingredientCounter}`;
    newIngredient.innerHTML = `
        <div class="col-md-6">
            <input type="text" id="ingredient-name-${ingredientCounter}" name="ingredient-name-${ingredientCounter}" class="form-control" placeholder="Ingredient Name">
            <span class="text-danger ingredient-name-error"></span>
        </div>
        <div class="col-md-4">
            <div class="input-group">
                <input type="number" id="ingredient-quantity-${ingredientCounter}" name="ingredient-quantity-${ingredientCounter}" class="form-control" placeholder="Quantity">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="ingredient-unit-button-${ingredientCounter}">Ounces</button>
                <ul class="dropdown-menu" aria-labelledby="ingredient-unit-button-${ingredientCounter}">
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Ounces')">Ounces</a></li>
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Milliliters')">Milliliters</a></li>
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Dashes')">Dashes</a></li>
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Teaspoons')">Teaspoons</a></li>
                </ul>
                <input type="hidden" id="ingredient-unit-${ingredientCounter}" name="ingredient-unit-${ingredientCounter}" value="ounces">
            </div>
            <span class="text-danger ingredient-quantity-error"></span>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredient('ingredient-${ingredientCounter}')">×</button>
        </div>
    `;
    ingredientsDiv.appendChild(newIngredient);
}

function removeIngredient(id) {
    const ingredient = document.getElementById(id);
    ingredient.parentNode.removeChild(ingredient);
}

function setUnit(counter, unit) {
    document.getElementById(`ingredient-unit-button-${counter}`).innerText = unit;
    document.getElementById(`ingredient-unit-${counter}`).value = unit.toLowerCase();
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
    const ingredients = ingredientsDiv.getElementsByClassName('row');

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
        liters: 1000,
        dashes: 0.92, // assuming 1 dash = 0.92 milliliters
        teaspoons: 4.92892 // assuming 1 teaspoon = 4.92892 milliliters
    };
    return quantity * conversionRates[unit];
}

function convertFromMilliliters(quantity, unit) {
    const conversionRates = {
        ounces: 1 / 29.5735,
        milliliters: 1,
        liters: 1 / 1000,
        dashes: 1 / 0.92,
        teaspoons: 1 / 4.92892
    };
    return quantity * conversionRates[unit];
}

function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.text-danger');
    errorMessages.forEach(error => {
        error.innerText = '';
    });
}
