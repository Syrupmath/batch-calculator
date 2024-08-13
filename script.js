document.getElementById('cocktail-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Gather the recipe name
    const recipeName = document.getElementById('recipe-name').value || 'Untitled';

    // Gather the ingredients
    const ingredients = [];
    document.querySelectorAll('#ingredients .input-group').forEach((group, index) => {
        const name = group.querySelector('.ingredient-name').value;
        const quantity = parseFloat(group.querySelector('.ingredient-quantity').value);
        const unit = group.querySelector('.ingredient-unit').value;
        if (name && quantity && unit) {
            ingredients.push({ name, quantity, unit });
        }
    });

    // Check batch size option and gather the value
    const batchSizeOption = document.querySelector('input[name="batch-size-option"]:checked');
    let batchSize = null;
    let batchSizeUnit = null;
    if (batchSizeOption) {
        if (batchSizeOption.id === 'option-servings') {
            batchSize = parseInt(document.getElementById('num-servings').value, 10);
        } else if (batchSizeOption.id === 'option-volume') {
            batchSize = parseFloat(document.getElementById('total-volume').value);
            batchSizeUnit = document.getElementById('total-volume-unit').value;
        }
    }

    // Gather dilution
    const dilution = parseFloat(document.getElementById('dilution').value);

    // Validate inputs
    if (ingredients.length === 0 || !batchSize) {
        alert('Please enter at least one ingredient and a batch size.');
        return;
    }

    // Calculate total volume in ounces if using volume
    if (batchSizeOption.id === 'option-volume') {
        switch (batchSizeUnit) {
            case 'liters':
                batchSize = batchSize * 33.814;
                break;
            case 'quarts':
                batchSize = batchSize * 32;
                break;
            case 'gallons':
                batchSize = batchSize * 128;
                break;
            // Assume ounces by default
        }
    }
    
// Function to format the quantity and unit, with special handling for dashes
function formatQuantityAndUnit(quantity, unit) {
    if (unit === 'dashes') {
        const dashesPerOunce = 48; // 1 ounce = 48 dashes
        let ounces = Math.floor(quantity / dashesPerOunce); // Whole ounces
        let remainingDashes = Math.round(quantity % dashesPerOunce); // Remaining dashes

        // Convert remaining dashes to the nearest quarter ounce if possible
        let additionalOunces = 0;
        if (remainingDashes >= 12) {
            additionalOunces = Math.floor(remainingDashes / 12) * 0.25;
            remainingDashes = remainingDashes % 12;
        }

        ounces += additionalOunces;

        // Format the output
        if (ounces > 0 && remainingDashes > 0) {
            return `${ounces} ${ounces === 1 ? 'ounce' : 'ounces'} plus ${remainingDashes} ${remainingDashes === 1 ? 'dash' : 'dashes'}`;
        } else if (ounces > 0) {
            return `${ounces} ${ounces === 1 ? 'ounce' : 'ounces'}`;
        } else {
            return `${remainingDashes} ${remainingDashes === 1 ? 'dash' : 'dashes'}`;
        }
    }

    // For other units, make the unit singular if the quantity is 1
    let formattedQuantity = quantity % 1 === 0 ? quantity.toFixed(0) : quantity.toFixed(2);
    if (formattedQuantity == 1) {
        unit = unit.slice(-1) === 's' ? unit.slice(0, -1) : unit;
    }

    return `${formattedQuantity} ${unit}`;
}

    // Calculate scaled ingredients based on number of servings
    const scaledIngredients = ingredients.map(ingredient => {
        let scaledQuantity;
        let scaledUnit = ingredient.unit;
        if (batchSizeOption.id === 'option-servings') {
            scaledQuantity = ingredient.quantity * batchSize;
        } else {
            const scalingFactor = batchSize / ingredients.reduce((acc, ing) => acc + ing.quantity, 0);
            scaledQuantity = ingredient.quantity * scalingFactor;
        }
        // Handle conversion to ounces if necessary
        switch (ingredient.unit) {
            case 'teaspoons':
                if (scaledQuantity >= 1.5) { // Convert to ounces if >= 1/4 ounce
                    scaledQuantity = scaledQuantity / 6;
                    scaledUnit = 'ounces';
                } else {
                    scaledQuantity = Math.ceil(scaledQuantity); // Round up teaspoons to nearest whole number
                }
                break;
            case 'dashes':
                if (scaledQuantity >= 12) { // Convert to ounces if >= 1/4 ounce
                    scaledQuantity = scaledQuantity / 48;
                    scaledUnit = 'ounces';
                } else {
                    scaledQuantity = Math.ceil(scaledQuantity); // Round up dashes to nearest whole number
                }
                break;
        }
                // Round to the nearest 1/4 ounce
        scaledQuantity = Math.round(scaledQuantity * 4) / 4;
        return { ...ingredient, scaledQuantity, scaledUnit };
    });

    // Calculate water to add for dilution if dilution is greater than 0
    let waterToAdd = 0;
    if (dilution > 0) {
        const totalScaledVolume = scaledIngredients.reduce((acc, ingredient) => acc + ingredient.scaledQuantity, 0);
        waterToAdd = Math.round((totalScaledVolume * (dilution / 100)) * 4) / 4;
    }

    // Update the original recipe and scaled recipe sections
    document.getElementById('output-recipe-name').textContent = recipeName;
    const originalRecipeContainer = document.getElementById('original-recipe');
    originalRecipeContainer.innerHTML = ingredients.map(ingredient => `
        <p>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</p>
    `).join('');
    const scaledRecipeContainer = document.getElementById('scaled-recipe');
    scaledRecipeContainer.innerHTML = scaledIngredients.map(ingredient => `
        <p>${formatQuantityAndUnit(ingredient.scaledQuantity, ingredient.scaledUnit)} ${ingredient.name}</p>
    `).join('');
    
    if (waterToAdd > 0) {
        scaledRecipeContainer.innerHTML += `
            <p>${formatQuantityAndUnit(waterToAdd, 'ounces')} Water</p>
        `;
    }

    // Update the scaled recipe title
    updateScaledRecipeTitle();

    function updateScaledRecipeTitle() {
    const batchSizeOption = document.querySelector('input[name="batch-size-option"]:checked');
    const scaledRecipeHeader = document.querySelector('#scaled-recipe-container .card-header');
    const dilutionValue = document.getElementById('dilution').value;

    if (batchSizeOption) {
        if (batchSizeOption.id === 'option-servings') {
            const numServings = document.getElementById('num-servings').value;
            scaledRecipeHeader.textContent = `Scaled Recipe - ${numServings} Servings (${dilutionValue}% Dilution)`;
        } else if (batchSizeOption.id === 'option-volume') {
            const totalVolume = document.getElementById('total-volume').value;
            const totalVolumeUnit = document.getElementById('total-volume-unit').value;
            scaledRecipeHeader.textContent = `Scaled Recipe - ${totalVolume} ${totalVolumeUnit.charAt(0).toUpperCase() + totalVolumeUnit.slice(1)} (${dilutionValue}% Dilution)`;
        }
    }
}

    // Show the output section
    document.getElementById('output').style.display = 'block';
});
function setUnit(index, unit) {
    document.getElementById(`ingredient-unit-button-${index}`).textContent = unit;
    document.getElementById(`ingredient-unit-${index}`).value = unit.toLowerCase();
}

function setTotalVolumeUnit(unit) {
    document.getElementById('total-volume-unit-button').textContent = unit;
    document.getElementById('total-volume-unit').value = unit.toLowerCase();
}

function setDilution(dilution) {
    document.getElementById('dilution').value = dilution;
    document.getElementById('custom-dilution').disabled = true;
}

function setDilutionCustom() {
    document.getElementById('dilution').value = document.getElementById('custom-dilution').value;
    document.getElementById('custom-dilution').disabled = false;
}

function addIngredient() {
    const ingredientCount = document.querySelectorAll('#ingredients .input-group').length + 1;
    const ingredientTemplate = `
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
    document.getElementById('ingredients').insertAdjacentHTML('beforeend', ingredientTemplate);
}

function removeIngredient(id) {
    document.getElementById(id).remove();
}

// Function to update the scaled recipe title
function updateScaledRecipeTitle() {
    const batchSizeOption = document.querySelector('input[name="batch-size-option"]:checked');
    const scaledRecipeHeader = document.querySelector('#scaled-recipe-container .card-header');
    
    if (batchSizeOption) {
        if (batchSizeOption.id === 'option-servings') {
            const numServings = document.getElementById('num-servings').value;
            scaledRecipeHeader.textContent = `Scaled Recipe - ${numServings} Servings`;
        } else if (batchSizeOption.id === 'option-volume') {
            const totalVolume = document.getElementById('total-volume').value;
            const totalVolumeUnit = document.getElementById('total-volume-unit').value;
            scaledRecipeHeader.textContent = `Scaled Recipe - ${totalVolume} ${totalVolumeUnit.charAt(0).toUpperCase() + totalVolumeUnit.slice(1)}`;
        }
    }
}

function toggleBatchSizeFields() {
    const batchSizeOption = document.querySelector('input[name="batch-size-option"]:checked');
    document.getElementById('num-servings').disabled = batchSizeOption.id !== 'option-servings';
    document.getElementById('total-volume').disabled = batchSizeOption.id !== 'option-volume';
    document.getElementById('total-volume-unit-button').disabled = batchSizeOption.id !== 'option-volume';
}
