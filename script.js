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
    } else if (unit === 'teaspoons') {
        return Math.round(quantity * 4) / 4; // rounding to nearest 1/4 teaspoon
    } else if (unit === 'dashes') {
        return Math.round(quantity * 4) / 4; // rounding to nearest 1/4 dash
    } else if (unit === 'milliliters') {
        return Math.round(quantity / 5) * 5;
    }
    return quantity;
}

// Convert total volume to ounces
function convertToOunces(volume, unit) {
    if (unit === 'liters') {
        return volume * 33.814;
    } else if (unit === 'quarts') {
        return volume * 32;
    } else if (unit === 'gallons') {
        return volume * 128;
    }
    return volume; // already in ounces
}

// Convert from ounces to original unit
function convertFromOunces(quantity, unit) {
    if (unit === 'teaspoons') {
        return quantity * 6;
    } else if (unit === 'dashes') {
        return quantity * 32;
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
        const quantity = parseFloat(group.querySelector('.ingredient-quantity').value);
        const unit = group.querySelector('.ingredient-unit').value;
        if (name && quantity && unit) {
            ingredients.push({ name, quantity, unit });
        }
    });

    const dilution = parseFloat(document.getElementById('dilution').value);
    const customDilution = parseFloat(document.getElementById('custom-dilution').value) || 0;
    const actualDilution = dilution > 0 ? dilution : customDilution;

    let scaledIngredients;
    let waterToAdd = 0;

    if (document.getElementById('option-servings').checked) {
        const numServings = parseFloat(document.getElementById('num-servings').value);

        // Scale ingredients based on number of servings
        scaledIngredients = ingredients.map(ingredient => {
            return { ...ingredient, quantity: ingredient.quantity * numServings };
        });

        // Calculate total volume in ounces
        const totalVolumeOunces = scaledIngredients.reduce((total, ingredient) => {
            let quantityInOunces = ingredient.quantity;
            if (ingredient.unit === 'teaspoons') {
                quantityInOunces = quantityInOunces / 6;
            } else if (ingredient.unit === 'dashes') {
                quantityInOunces = quantityInOunces / 32;
            }
            return total + quantityInOunces;
        }, 0);

        // Calculate the amount of water to add based on the dilution percentage
        waterToAdd = totalVolumeOunces * (actualDilution / 100);

    } else if (document.getElementById('option-volume').checked) {
        const totalVolume = parseFloat(document.getElementById('total-volume').value);
        const totalVolumeUnit = document.getElementById('total-volume-unit').value;
        const totalBatchSizeOunces = convertToOunces(totalVolume, totalVolumeUnit);

        // Calculate the amount of water to add based on the dilution percentage
        waterToAdd = totalBatchSizeOunces * (actualDilution / 100);

        // Calculate total volume of ingredients
        const totalVolumeOfIngredients = totalBatchSizeOunces - waterToAdd;

        // Calculate total original volume in ounces
        const totalOriginalVolumeOunces = ingredients.reduce((total, ingredient) => {
            let quantityInOunces = ingredient.quantity;
            if (ingredient.unit === 'teaspoons') {
                quantityInOunces = quantityInOunces / 6;
            } else if (ingredient.unit === 'dashes') {
                quantityInOunces = quantityInOunces / 32;
            }
            return total + quantityInOunces;
        }, 0);

        // Calculate scaling factor based on total volume of ingredients
        const scalingFactor = totalVolumeOfIngredients / totalOriginalVolumeOunces;

        // Scale ingredients
        scaledIngredients = ingredients.map(ingredient => {
            let scaledQuantity = ingredient.quantity * scalingFactor;
            return { ...ingredient, quantity: scaledQuantity };
        });
    }

    // Round quantities
    const roundedIngredients = scaledIngredients.map(ingredient => {
        return { ...ingredient, quantity: roundQuantity(ingredient.quantity, ingredient.unit) };
    });

    // Display results
    document.getElementById('output-recipe-name').textContent = recipeName;
    document.getElementById('original-recipe').innerHTML = ingredients.map(ingredient => `<p>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</p>`).join('');
    document.getElementById('scaled-recipe').innerHTML = roundedIngredients.map(ingredient => `<p>${ingredient.quantity.toFixed(2)} ${ingredient.unit} ${ingredient.name}</p>`).join('');
    document.getElementById('scaled-recipe').innerHTML += `<p>${roundQuantity(waterToAdd, 'ounces').toFixed(2)} ounces water</p>`;
    document.getElementById('output').style.display = 'block';
});
