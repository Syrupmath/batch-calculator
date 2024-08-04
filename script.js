// JavaScript for the Batched Cocktail Calculator

// Add ingredient function
function addIngredient() {
    const ingredientCount = document.querySelectorAll('#ingredients .input-group').length + 1;
    const ingredientHtml = `
        <div class="mb-3" id="ingredient-${ingredientCount}">
            <div class="input-group">
                <input type="text" id="ingredient-name-${ingredientCount}" name="ingredient-name-${ingredientCount}" class="form-control ingredient-name" placeholder="Ingredient Name">
                <input type="number" id="ingredient-quantity-${ingredientCount}" name="ingredient-quantity-${ingredientCount}" class="form-control ingredient-quantity" placeholder="Quantity">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="ingredient-unit-button-${ingredientCount}">Ounces</button>
                <ul class="dropdown-menu" aria-labelledby="ingredient-unit-button-${ingredientCount}">
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCount}, 'Ounces')">Ounces</a></li>
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCount}, 'Teaspoons')">Teaspoons</a></li>
                    <li><a class="dropdown-item" href="#" onclick="setUnit(${ingredientCount}, 'Dashes')">Dashes</a></li>
                </ul>
                <input type="hidden" id="ingredient-unit-${ingredientCount}" name="ingredient-unit-${ingredientCount}" class="ingredient-unit" value="ounces">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredient('ingredient-${ingredientCount}')">×</button>
            </div>
        </div>
    `;
    document.getElementById('ingredients').insertAdjacentHTML('beforeend', ingredientHtml);
}

// Remove ingredient function
function removeIngredient(id) {
    document.getElementById(id).remove();
}

// Set unit function
function setUnit(index, unit) {
    document.getElementById(`ingredient-unit-${index}`).value = unit.toLowerCase();
    document.getElementById(`ingredient-unit-button-${index}`).textContent = unit;
}

// Toggle batch size fields function
function toggleBatchSizeFields() {
    const optionServings = document.getElementById('option-servings');
    const optionVolume = document.getElementById('option-volume');
    const numServings = document.getElementById('num-servings');
    const totalVolume = document.getElementById('total-volume');
    const totalVolumeUnitButton = document.getElementById('total-volume-unit-button');

    if (optionServings.checked) {
        numServings.disabled = false;
        totalVolume.disabled = true;
        totalVolumeUnitButton.disabled = true;
    } else if (optionVolume.checked) {
        numServings.disabled = true;
        totalVolume.disabled = false;
        totalVolumeUnitButton.disabled = false;
    }
}

// Set total volume unit function
function setTotalVolumeUnit(unit) {
    document.getElementById('total-volume-unit').value = unit.toLowerCase();
    document.getElementById('total-volume-unit-button').textContent = unit;
}

// Set dilution function
function setDilution(percent) {
    document.getElementById('dilution').value = percent;
    document.getElementById('custom-dilution').disabled = true;
}

// Set custom dilution function
function setDilutionCustom() {
    document.getElementById('custom-dilution').disabled = false;
}

// Round to nearest quarter ounce or 5 milliliters
function roundQuantity(quantity, unit) {
    if (unit === 'ounces') {
        return Math.round(quantity * 4) / 4;
    } else if (unit === 'milliliters') {
        return Math.round(quantity / 5) * 5;
    }
    return quantity;
}

// Calculate function
document.getElementById('cocktail-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const recipeName = document.getElementById('recipe-name').value || 'Untitled';
    const ingredients = [];
    document.querySelectorAll('#ingredients .input-group').forEach((group, index) => {
        const name = group.querySelector('.ingredient-name').value;
        const quantity = group.querySelector('.ingredient-quantity').value;
        const unit = group.querySelector('.ingredient-unit').value;
        if (name && quantity && unit) {
            ingredients.push({ name, quantity: parseFloat(quantity), unit });
        }
    });

    let batchSize = 0;
    let batchSizeUnit = '';

    if (document.getElementById('option-servings').checked) {
        batchSize = parseFloat(document.getElementById('num-servings').value);
        batchSizeUnit = 'servings';
    } else if (document.getElementById('option-volume').checked) {
        batchSize = parseFloat(document.getElementById('total-volume').value);
        batchSizeUnit = document.getElementById('total-volume-unit').value;
    }

    const dilution = parseFloat(document.getElementById('dilution').value);
    const customDilution = parseFloat(document.getElementById('custom-dilution').value) || 0;

    // Perform scaling calculations
    const scaledIngredients = ingredients.map(ingredient => {
        let scaledQuantity;
        if (batchSizeUnit === 'servings') {
            scaledQuantity = ingredient.quantity * batchSize;
        } else {
            scaledQuantity = ingredient.quantity * (batchSize / ingredients.length);
        }
        if (dilution > 0) {
            scaledQuantity = scaledQuantity * (1 + (dilution / 100));
        } else if (customDilution > 0) {
            scaledQuantity = scaledQuantity * (1 + (customDilution / 100));
        }
        scaledQuantity = roundQuantity(scaledQuantity, ingredient.unit);
        return { ...ingredient, quantity: scaledQuantity };
    });

    // Display results
    document.getElementById('output-recipe-name').textContent = recipeName;
    document.getElementById('original-recipe').innerHTML = ingredients.map(ingredient => `<p>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</p>`).join('');
    document.getElementById('scaled-recipe').innerHTML = scaledIngredients.map(ingredient => `<p>${ingredient.quantity.toFixed(2)} ${ingredient.unit} ${ingredient.name}</p>`).join('');
    document.getElementById('output').style.display = 'block';
});
