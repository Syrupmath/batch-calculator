document.getElementById('cocktail-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Reset validation
    resetValidation();

    // Gather the recipe name
    const recipeName = document.getElementById('recipe-name').value || 'Untitled';

    // Gather the ingredients
    const ingredients = [];
    let validIngredients = false;
    document.querySelectorAll('#ingredients .input-group').forEach((group, index) => {
        const name = group.querySelector('.ingredient-name').value;
        const quantity = parseFloat(group.querySelector('.ingredient-quantity').value);
        const unit = group.querySelector('.ingredient-unit').value;
        if (name && quantity && unit) {
            ingredients.push({ name, quantity, unit });
            validIngredients = true;
        } else {
            if (!name) group.querySelector('.ingredient-name').classList.add('is-invalid');
            if (!quantity || quantity <= 0) group.querySelector('.ingredient-quantity').classList.add('is-invalid');
            if (!unit) group.querySelector('.ingredient-unit-button').classList.add('is-invalid');
        }
    });

    // Validate batch size
    const batchSizeOption = document.querySelector('input[name="batch-size-option"]:checked');
    let batchSize = null;
    let batchSizeUnit = null;
    let originalRecipeVolume = ingredients.reduce((acc, ingredient) => acc + ingredient.quantity, 0);
    if (batchSizeOption) {
        if (batchSizeOption.id === 'option-servings') {
            batchSize = parseInt(document.getElementById('num-servings').value, 10);
            if (!batchSize || batchSize <= 0) {
                document.getElementById('num-servings').classList.add('is-invalid');
            }
        } else if (batchSizeOption.id === 'option-volume') {
            batchSize = parseFloat(document.getElementById('total-volume').value);
            batchSizeUnit = document.getElementById('total-volume-unit').value;
            if (!batchSize || batchSize <= 0 || !batchSizeUnit) {
                document.getElementById('total-volume').classList.add('is-invalid');
                document.getElementById('total-volume-unit-button').classList.add('is-invalid');
            } else {
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
        }
    } else {
        document.querySelectorAll('input[name="batch-size-option"]').forEach(option => {
            option.classList.add('is-invalid');
        });
    }

    // Ensure batch size is larger than original recipe volume
    if (batchSize <= originalRecipeVolume) {
        document.getElementById('num-servings').classList.add('is-invalid');
        document.getElementById('total-volume').classList.add('is-invalid');
    }

    // Validate dilution
    const dilutionOption = document.querySelector('input[name="dilution-option"]:checked');
    let dilution = null;
    if (dilutionOption) {
        if (dilutionOption.id === 'option-custom') {
            dilution = parseFloat(document.getElementById('custom-dilution').value);
            if (!dilution || dilution < 0 || dilution > 100) {
                document.getElementById('custom-dilution').classList.add('is-invalid');
            }
        } else {
            dilution = parseFloat(dilutionOption.value);
        }
    } else {
        document.querySelectorAll('input[name="dilution-option"]').forEach(option => {
            option.classList.add('is-invalid');
        });
    }

    // Final validation check
    if (!validIngredients || !batchSize || batchSize <= originalRecipeVolume || !dilution) {
        return;
    }

    // Calculate scaled ingredients
    const totalIngredientsVolume = ingredients.reduce((acc, ingredient) => {
        switch (ingredient.unit) {
            case 'teaspoons':
                return acc + (ingredient.quantity / 6); // 1 oz = 6 tsp
            case 'dashes':
                return acc + (ingredient.quantity / 48); // 1 oz = 48 dashes
            default:
                return acc + ingredient.quantity;
        }
    }, 0);

    const scalingFactor = batchSize / (totalIngredientsVolume * (1 + dilution / 100));
    const scaledIngredients = ingredients.map(ingredient => {
        let scaledQuantity;
        let scaledUnit = ingredient.unit;
        switch (ingredient.unit) {
            case 'teaspoons':
                scaledQuantity = ingredient.quantity * scalingFactor;
                if (scaledQuantity >= 1.5) { // Convert to ounces if >= 1/4 ounce
                    scaledQuantity = scaledQuantity / 6;
                    scaledUnit = 'ounces';
                }
                break;
            case 'dashes':
                scaledQuantity = ingredient.quantity * scalingFactor;
                if (scaledQuantity >= 12) { // Convert to ounces if >= 1/4 ounce
                    scaledQuantity = scaledQuantity / 48;
                    scaledUnit = 'ounces';
                }
                break;
            default:
                scaledQuantity = ingredient.quantity * scalingFactor;
        }
        // Round to the nearest 1/4 ounce
        scaledQuantity = Math.round(scaledQuantity * 4) / 4;
        return { ...ingredient, scaledQuantity, scaledUnit };
    });

    // Calculate water to add for dilution
    const totalScaledVolume = scaledIngredients.reduce((acc, ingredient) => acc + ingredient.scaledQuantity, 0);
    const waterToAdd = Math.round((totalScaledVolume * (dilution / 100)) * 4) / 4;

    // Update the original recipe and scaled recipe sections
    document.getElementById('output-recipe-name').textContent = recipeName;
    const originalRecipeContainer = document.getElementById('original-recipe');
    originalRecipeContainer.innerHTML = ingredients.map(ingredient => `
        <p>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</p>
    `).join('');
    const scaledRecipeContainer = document.getElementById('scaled-recipe');
    scaledRecipeContainer.innerHTML = scaledIngredients.map(ingredient => `
        <p>${ingredient.scaledQuantity.toFixed(2)} ${ingredient.scaledUnit} ${ingredient.name}</p>
    `).join('') + `
        <p>${waterToAdd.toFixed(2)} ounces Water</p>
    `;

    // Update the scaled recipe title
    updateScaledRecipeTitle();

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

// Reset validation
function resetValidation() {
    document.querySelectorAll('.is-invalid').forEach(element => {
        element.classList.remove('is-invalid');
    });
}
