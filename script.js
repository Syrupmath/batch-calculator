document.addEventListener('DOMContentLoaded', (event) => {
    // Event listener for adding new ingredient fields
    document.getElementById('add-ingredient').addEventListener('click', addIngredient);

    // Event listener for form submission
    document.getElementById('cocktail-form').addEventListener('submit', function(event) {
        event.preventDefault();
        calculateBatch();
    });
});

// Function to add new ingredient fields
function addIngredient() {
    const ingredientCount = document.querySelectorAll('#ingredients .mb-3').length + 1;
    const ingredientDiv = document.createElement('div');
    ingredientDiv.classList.add('mb-3');
    ingredientDiv.id = `ingredient-${ingredientCount}`;
    ingredientDiv.innerHTML = `
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
    `;
    document.getElementById('ingredients').appendChild(ingredientDiv);
}

// Function to set unit
function setUnit(ingredientNumber, unit) {
    document.getElementById(`ingredient-unit-${ingredientNumber}`).value = unit.toLowerCase();
    document.getElementById(`ingredient-unit-button-${ingredientNumber}`).textContent = unit;
}

// Function to remove ingredient fields
function removeIngredient(ingredientId) {
    document.getElementById(ingredientId).remove();
}

// Function to toggle batch size fields
function toggleBatchSizeFields() {
    const isServingsSelected = document.getElementById('option-servings').checked;
    document.getElementById('num-servings').disabled = !isServingsSelected;
    document.getElementById('total-volume').disabled = isServingsSelected;
    document.getElementById('total-volume-unit-button').disabled = isServingsSelected;
}

// Function to set dilution percentage
function setDilution(percentage) {
    document.getElementById('custom-dilution').disabled = true;
    document.getElementById('dilution').value = percentage;
}

// Function to enable custom dilution
function setDilutionCustom() {
    document.getElementById('custom-dilution').disabled = false;
}

// Function to calculate the batch recipe
function calculateBatch() {
    const recipeName = document.getElementById('recipe-name').value || "Untitled";
    const ingredients = [];
    document.querySelectorAll('#ingredients .mb-3').forEach((ingredientDiv, index) => {
        const name = ingredientDiv.querySelector('.ingredient-name').value;
        const quantity = parseFloat(ingredientDiv.querySelector('.ingredient-quantity').value);
        const unit = ingredientDiv.querySelector('.ingredient-unit').value;
        if (name && !isNaN(quantity) && unit) {
            ingredients.push({ name, quantity, unit });
        }
    });

    const isServingsSelected = document.getElementById('option-servings').checked;
    const numServings = parseFloat(document.getElementById('num-servings').value);
    const totalVolume = parseFloat(document.getElementById('total-volume').value);
    const totalVolumeUnit = document.getElementById('total-volume-unit').value;
    const dilution = parseFloat(document.getElementById('dilution').value);
    const scaledIngredients = [];

    let scaleFactor;
    let finalTotalVolume;
    if (isServingsSelected && !isNaN(numServings)) {
        scaleFactor = numServings;
        ingredients.forEach(ingredient => {
            scaledIngredients.push({
                name: ingredient.name,
                quantity: ingredient.quantity * scaleFactor,
                unit: ingredient.unit
            });
        });
        finalTotalVolume = scaledIngredients.reduce((total, ingredient) => total + ingredient.quantity, 0) * (1 + dilution / 100);
    } else if (!isNaN(totalVolume) && totalVolumeUnit) {
        const totalVolumeInOunces = convertToOunces(totalVolume, totalVolumeUnit);
        scaleFactor = totalVolumeInOunces / ingredients.reduce((total, ingredient) => total + ingredient.quantity, 0);
        ingredients.forEach(ingredient => {
            scaledIngredients.push({
                name: ingredient.name,
                quantity: ingredient.quantity * scaleFactor,
                unit: ingredient.unit
            });
        });
        finalTotalVolume = totalVolumeInOunces * (1 + dilution / 100);
    }

    // Display results
    document.getElementById('output-recipe-name').textContent = recipeName;
    displayRecipe('original-recipe', ingredients);
    displayRecipe('scaled-recipe', scaledIngredients);

    const scaledRecipeHeader = document.querySelector('#scaled-recipe-container .card-header');
    scaledRecipeHeader.textContent = `Scaled Recipe (Total Volume: ${finalTotalVolume.toFixed(2)} ${totalVolumeUnit || 'ounces'})`;

    document.getElementById('output').style.display = 'block';
}

// Function to convert different volume units to ounces
function convertToOunces(volume, unit) {
    const conversionRates = {
        ounces: 1,
        liters: 33.814,
        quarts: 32,
        gallons: 128
    };
    return volume * (conversionRates[unit.toLowerCase()] || 1);
}

// Function to display the recipe
function displayRecipe(containerId, ingredients) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    ingredients.forEach(ingredient => {
        const ingredientDiv = document.createElement('div');
        ingredientDiv.textContent = `${ingredient.quantity.toFixed(2)} ${ingredient.unit} ${ingredient.name}`;
        container.appendChild(ingredientDiv);
    });
}
