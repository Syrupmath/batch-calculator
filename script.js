function addIngredient() {
    const ingredientsDiv = document.getElementById('ingredients');
    const ingredientCount = ingredientsDiv.children.length + 1;
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('ingredient');
    newIngredient.id = `ingredient-${ingredientCount}`;
    newIngredient.innerHTML = `
        <div class="input-group">
            <label for="ingredient-name-${ingredientCount}">Ingredient Name:</label>
            <input type="text" id="ingredient-name-${ingredientCount}" name="ingredient-name-${ingredientCount}" placeholder="E.g., Rye">
        </div>
        <div class="input-group">
            <label for="ingredient-quantity-${ingredientCount}">Quantity:</label>
            <input type="number" id="ingredient-quantity-${ingredientCount}" name="ingredient-quantity-${ingredientCount}" placeholder="E.g., 2">
        </div>
        <div class="input-group">
            <label for="ingredient-unit-${ingredientCount}">Unit:</label>
            <select id="ingredient-unit-${ingredientCount}" name="ingredient-unit-${ingredientCount}">
                <option value="ounces">Ounces</option>
                <option value="milliliters">Milliliters</option>
            </select>
        </div>
    `;
    ingredientsDiv.appendChild(newIngredient);
}

function calculateRecipe() {
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

    for (let i = 0; i < ingredients.length; i++) {
        const name = ingredients[i].querySelector(`[name="ingredient-name-${i + 1}"]`).value;
        const quantity = parseFloat(ingredients[i].querySelector(`[name="ingredient-quantity-${i + 1}"]`).value) || 0;
        const unit = ingredients[i].querySelector(`[name="ingredient-unit-${i + 1}"]`).value;

        if (inputUnit === '') {
            inputUnit = unit;
        }

        originalRecipe += `<li>${name}: ${quantity} ${unit}</li>`;

        let volumeInMilliliters = convertToMilliliters(quantity, unit);
        totalIngredientVolume += volumeInMilliliters;
        ingredientVolumes.push({ name, volumeInMilliliters });
    }

    originalRecipe += '</ul>';
    document.getElementById('original-recipe').innerHTML = originalRecipe;

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
        alert('Please enter either the number of servings or the total volume.');
        return;
    }

    if (totalVolume < totalIngredientVolume + waterVolume) {
        alert('Total volume is less than the volume of ingredients plus dilution. Please increase the total volume.');
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
