let ingredientCounter = 1;

function addIngredient() {
    ingredientCounter++;
    const ingredientsDiv = document.getElementById('ingredients');
    const newIngredient = document.createElement('div');
    newIngredient.classList.add('mb-3');
    newIngredient.id = `ingredient-${ingredientCounter}`;
    newIngredient.innerHTML = `
        <div class="input-group">
            <input type="text" id="ingredient-name-${ingredientCounter}" name="ingredient-name-${ingredientCounter}" class="form-control" placeholder="Ingredient Name" required>
            <input type="number" id="ingredient-quantity-${ingredientCounter}" name="ingredient-quantity-${ingredientCounter}" class="form-control" placeholder="Quantity" required>
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="ingredient-unit-button-${ingredientCounter}">Ounces</button>
            <ul class="dropdown-menu" aria-labelledby="ingredient-unit-button-${ingredientCounter}">
                <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Ounces')">Ounces</a></li>
                <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Milliliters')">Milliliters</a></li>
                <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Dashes')">Dashes</a></li>
                <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCounter}, 'Teaspoons')">Teaspoons</a></li>
            </ul>
            <input type="hidden" id="ingredient-unit-${ingredientCounter}" name="ingredient-unit-${ingredientCounter}" value="ounces">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredient('ingredient-${ingredientCounter}')">×</button>
        </div>
        <div class="invalid-feedback">Please complete all ingredient fields.</div>
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

    const dilutionButtons = document.querySelectorAll('.dilution-button');
    dilutionButtons.forEach(button => {
        button.classList.toggle('btn-primary', button.dataset.dilution === dilution.toString());
        button.classList.toggle('btn-outline-primary', button.dataset.dilution !== dilution.toString());
    });
}

function calculateRecipe(event) {
    event.preventDefault();

    const form = document.getElementById('cocktail-form');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const recipeName = document.getElementById('recipe-name').value.trim();
    const numServings = parseFloat(document.getElementById('num-servings').value);
    const totalVolumeInput = parseFloat(document.getElementById('total-volume').value);
    const totalVolumeUnit = document.getElementById('total-volume-unit').value;
    let dilution = parseFloat(document.getElementById('dilution').value) / 100;
    const customDilution = parseFloat(document.getElementById('custom-dilution').value);

    if (!isNaN(customDilution)) {
        dilution = customDilution / 100;
    }

    const ingredients = Array.from(document.getElementsByClassName('input-group'));
    let totalIngredientVolume = 0;
    const ingredientVolumes = [];
    let originalRecipe = '<ul>';
    let inputUnit = '';

    ingredients.forEach((ingredientDiv, index) => {
        const name = ingredientDiv.querySelector(`[name="ingredient-name-${index + 1}"]`).value.trim();
        const quantity = parseFloat(ingredientDiv.querySelector(`[name="ingredient-quantity-${index + 1}"]`).value) || 0;
        const unit = ingredientDiv.querySelector(`[name="ingredient-unit-${index + 1}"]`).value;

        if (name && !isNaN(quantity) && quantity > 0 && unit) {
            originalRecipe += `<li>${name}: ${quantity} ${unit}</li>`;

            if (inputUnit === '') {
                inputUnit = unit;
            }

            const volumeInMilliliters = convertToMilliliters(quantity, unit);
            totalIngredientVolume += volumeInMilliliters;
            ingredientVolumes.push({ name, volumeInMilliliters });
        }
    });

    originalRecipe += '</ul>';
    document.getElementById('original-recipe').innerHTML = originalRecipe;
    document.getElementById('output-recipe-name').innerText = recipeName;

    const waterVolume = totalIngredientVolume * dilution;
    let totalVolume;

    if (numServings) {
        totalVolume = (totalIngredientVolume + waterVolume) * numServings;
    } else if (totalVolumeInput) {
        totalVolume = convertToMilliliters(totalVolumeInput, totalVolumeUnit);
    }

    const scalingFactor = totalVolume / (totalIngredientVolume + waterVolume);
    let scaledRecipe = '<ul>';

    ingredientVolumes.forEach(ingredient => {
        const scaledQuantity = ingredient.volumeInMilliliters * scalingFactor;
        scaledRecipe += `<li>${ingredient.name}: ${convertFromMilliliters(scaledQuantity, inputUnit).toFixed(2)} ${inputUnit}</li>`;
    });

    if (waterVolume > 0) {
        const scaledWaterVolume = waterVolume * scalingFactor;
        scaledRecipe += `<li>Water: ${convertFromMilliliters(scaledWaterVolume, inputUnit).toFixed(2)} ${inputUnit}</li>`;
    }

    scaledRecipe += '</ul>';
    document.getElementById('scaled-recipe').innerHTML = scaledRecipe;
    document.getElementById('output').style.display = 'block';
}

function convertToMilliliters(quantity, unit) {
    const conversionRates = {
        ounces: 29.5735,
        milliliters: 1,
        liters: 1000,
        quarts: 946.353,
        gallons: 3785.41,
        dashes: 0.92,
        teaspoons: 4.92892
    };
    return quantity * (conversionRates[unit] || 1);
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
    return quantity * (conversionRates[unit] || 1);
}

document.getElementById('cocktail-form').addEventListener('submit', calculateRecipe);
