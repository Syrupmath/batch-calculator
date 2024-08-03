let ingredientCounter = 1;

function addIngredient() {
    ingredientCounter++;
    const ingredientsDiv = document.getElementById('ingredients');
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('input-group', 'mb-3');
    newIngredient.id = `ingredient-${ingredientCounter}`;
    newIngredient.innerHTML = `
        <input type="text" id="ingredient-name-${ingredientCounter}" name="ingredient-name-${ingredientCounter}" class="form-control" placeholder="Ingredient Name">
        <input type="number" id="ingredient-quantity-${ingredientCounter}" name="ingredient-quantity-${ingredientCounter}" class="form-control" placeholder="Quantity">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="ingredient-unit-button-${ingredientCounter}">Ounces</button>
        <ul class="dropdown-menu" aria-labelledby="ingredient-unit-button-${ingredientCounter}">
            <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Ounces')">Ounces</a></li>
            <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Milliliters')">Milliliters</a></li>
            <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Dashes')">Dashes</a></li>
            <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Teaspoons')">Teaspoons</a></li>
        </ul>
        <input type="hidden" id="ingredient-unit-${ingredientCounter}" name="ingredient-unit-${ingredientCounter}" value="ounces">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredient('ingredient-${ingredientCounter}')">×</button>
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

function setTotalVolumeUnit(unit) {
    document.getElementById('total-volume-unit-button').innerText = unit;
    document.getElementById('total-volume-unit').value = unit.toLowerCase();
}

function setDilution(dilution) {
    document.getElementById('dilution').value = dilution;
    document.getElementById('custom-dilution').value = '';

    // Clear active state from all buttons
    const dilutionButtons = document.querySelectorAll('.dilution-button');
    dilutionButtons.forEach(button => {
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-primary');
    });

    // Set active state on the selected button
    const selectedButton = document.querySelector(`.dilution-button[data-dilution="${dilution}"]`);
    selectedButton.classList.remove('btn-outline-primary');
    selectedButton.classList.add('btn-primary');
}

function calculateRecipe() {
    // Clear previous error messages
    clearErrorMessages();

    const recipeName = document.getElementById('recipe-name').value;
    const numServings = parseFloat(document.getElementById('num-servings').value);
    const totalVolumeInput = parseFloat(document.getElementById('total-volume').value);
    const totalVolumeUnit = document.getElementById('total-volume-unit').value;
    let dilution = parseFloat(document.getElementById('dilution').value) / 100;
    const customDilution = parseFloat(document.getElementById('custom-dilution').value);

    if (!isNaN(customDilution)) {
        dilution = customDilution / 100;
    }

    const ingredientsDiv = document.getElementById('ingredients');
    const ingredients = ingredientsDiv.getElementsByClassName('input-group');

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
        } else if (totalVolumeUnit === 'quarts') {
            totalVolume = totalVolumeInput * 946.353; // Convert quarts to milliliters
        } else if (totalVolumeUnit === 'gallons') {
            totalVolume = totalVolumeInput * 3785.41; // Convert gallons to milliliters
        } else {
            totalVolume = totalVolumeInput * (totalVolumeUnit === 'ounces' ? 29.5735 : 1); // Convert ounces to milliliters
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
        quarts: 946.353,
        gallons: 3785.41,
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
        quarts: 1 / 946.353,
        gallons: 1 / 3785.41,
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
