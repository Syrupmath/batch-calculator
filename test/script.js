document.addEventListener("DOMContentLoaded", function () {
    const ingredientList = document.getElementById("ingredient-list");
    const addIngredientButton = document.getElementById("add-ingredient");
    const calculateButton = document.getElementById("calculate-batch");
    const scalingOptionInputs = document.querySelectorAll("input[name='scaling-option']");
    const volumeUnitSelect = document.getElementById("volume-unit");
    const scalingValueInput = document.getElementById("scaling-value");
    const dilutionOptionInputs = document.querySelectorAll("input[name='dilution-option']");
    const customDilutionInput = document.getElementById("custom-dilution");
    const originalRecipeDisplay = document.getElementById("original-recipe");
    const scaledRecipeDisplay = document.getElementById("scaled-recipe");
    const scaledRecipeHeader = document.getElementById("scaled-recipe-header");
    const resultsSection = document.getElementById("results");
    const resultsDrinkName = document.getElementById("results-drink-name");
    const batchInfo = document.getElementById("batch-info");
    const printRecipeButton = document.getElementById("print-recipe");

    // Function to add a new ingredient to the list
    function addIngredient(name = '', quantity = '', unit = 'oz') {
        const li = document.createElement('li');
        li.classList.add('mb-3');
        li.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control ingredient-name" placeholder="Ingredient" value="${name}">
                <input type="number" class="form-control ingredient-quantity" placeholder="Qty." step="${unit === 'oz' || unit === 'tsp' ? '0.1' : '1'}" value="${quantity}">
                <select class="form-select ingredient-unit">
                    <option value="oz" ${unit === 'oz' ? 'selected' : ''}>Ounces</option>
                    <option value="ml" ${unit === 'ml' ? 'selected' : ''}>Milliliters</option>
                    <option value="tsp" ${unit === 'tsp' ? 'selected' : ''}>Teaspoons</option>
                    <option value="dashes" ${unit === 'dashes' ? 'selected' : ''}>Dashes</option>
                    <option value="drops" ${unit === 'drops' ? 'selected' : ''}>Drops</option>
                </select>
                <button class="btn btn-danger" type="button">&times;</button>
            </div>
        `;
        ingredientList.appendChild(li);
    }

    // Event delegation for removing ingredients
    ingredientList.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-danger')) {
            event.target.parentElement.parentElement.remove();
        }
    });

    // Handle adding an ingredient
    addIngredientButton.onclick = () => addIngredient();

    // Handle enabling/disabling custom dilution input
    dilutionOptionInputs.forEach(input => {
        input.addEventListener('change', () => {
            customDilutionInput.disabled = input.value !== 'custom';
        });
    });

    // Handle enabling/disabling volume unit selection
    scalingOptionInputs.forEach(input => {
        input.addEventListener('change', () => {
            volumeUnitSelect.disabled = input.value !== 'volume';
        });
    });

    // Convert units to ounces for scaling calculations
    function convertToOunces(quantity, unit) {
        switch (unit) {
            case 'oz':
                return quantity;
            case 'ml':
                return quantity * 0.033814;
            case 'l':
                return quantity * 33.814;
            case 'gal':
                return quantity * 128;
            case 'tsp':
                return quantity * 0.166667;
            case 'dashes':
                return quantity * 0.020833;
            case 'drops':
                return quantity * 0.0016907;
            default:
                return 0;
        }
    }

    // Validate if at least one ingredient is fully filled out
    function isIngredientValid() {
        const ingredients = document.querySelectorAll('#ingredient-list li');
        for (let ingredient of ingredients) {
            const name = ingredient.querySelector('.ingredient-name').value.trim();
            const quantity = parseFloat(ingredient.querySelector('.ingredient-quantity').value);
            const unit = ingredient.querySelector('.ingredient-unit').value;

            if (name !== '' && !isNaN(quantity) && quantity > 0 && unit !== '') {
                return true;
            }
        }
        return false;
    }

    // Handle the batch calculation logic
    calculateButton.onclick = () => {
        // Validation checks
        if (!isIngredientValid()) {
            alert("Please ensure at least one ingredient is fully filled out (name, quantity, and unit).");
            return;
        }

        const scalingValue = parseFloat(scalingValueInput.value);
        if (isNaN(scalingValue) || scalingValue <= 0) {
            alert("Please enter a valid number for servings or total volume.");
            return;
        }

        const recipeName = document.getElementById("recipe-name").value || "Unnamed Cocktail";
        resultsDrinkName.textContent = recipeName;

        const scalingOption = document.querySelector("input[name='scaling-option']:checked").value;

        // Create the original recipe as a list
        let originalRecipe = '<ul>';
        let totalVolume = 0;

        const ingredients = document.querySelectorAll('#ingredient-list li');
        ingredients.forEach(ingredient => {
            const name = ingredient.querySelector('.ingredient-name').value.trim();
            const quantity = parseFloat(ingredient.querySelector('.ingredient-quantity').value);
            const unit = ingredient.querySelector('.ingredient-unit').value;

            if (name !== '' && !isNaN(quantity) && quantity > 0 && unit !== '') {
                const quantityInOunces = convertToOunces(quantity, unit);
                totalVolume += quantityInOunces;
                originalRecipe += `<li>${quantity} ${unit} ${name}</li>`;
            }
        });
        originalRecipe += '</ul>';

        let dilution;
        const selectedDilutionOption = document.querySelector("input[name='dilution-option']:checked").value;

        if (selectedDilutionOption === 'custom') {
            dilution = parseFloat(customDilutionInput.value) || 0;
        } else {
            dilution = parseFloat(selectedDilutionOption);
        }

        const dilutionVolume = (dilution / 100) * totalVolume;
        const finalTotalVolume = totalVolume + dilutionVolume;

        let scalingFactor = 1;
        let scalingInfo = '';

        // Map volume units to full names
        const volumeUnits = {
            'oz': 'Ounces',
            'ml': 'Milliliters',
            'l': 'Liters',
            'gal': 'Gallons'
        };

        if (scalingOption === "servings") {
            scalingFactor = scalingValue;
            scalingInfo = `${scalingValue} Servings`;
        } else if (scalingOption === "volume") {
            const volumeUnit = volumeUnitSelect.value;
            const targetVolume = convertToOunces(scalingValue, volumeUnit);
            scalingFactor = targetVolume / finalTotalVolume;
            const fullUnitName = volumeUnits[volumeUnit] || volumeUnit;
            scalingInfo = `${scalingValue} ${fullUnitName}`;
        }

        // Update the batch info with dynamic information
        batchInfo.textContent = `Batch Size: ${scalingInfo} (${dilution}% Dilution)`;

        scaledRecipeHeader.textContent = `Scaled Recipe`;

        // Create the scaled recipe as a list
        let scaledRecipe = '<ul>';

        ingredients.forEach(ingredient => {
            const name = ingredient.querySelector('.ingredient-name').value.trim();
            const quantity = parseFloat(ingredient.querySelector('.ingredient-quantity').value);
            const unit = ingredient.querySelector('.ingredient-unit').value;

            if (name !== '' && !isNaN(quantity) && quantity > 0 && unit !== '') {
                const quantityInOunces = convertToOunces(quantity, unit);
                const scaledQuantityNum = quantityInOunces * scalingFactor;
                scaledRecipe += `<li>${scaledQuantityNum.toFixed(2)} oz/${(scaledQuantityNum * 29.5735).toFixed(2)} ml ${name}</li>`;
            }
        });

        if (dilution > 0) {
            const scaledDilutionNum = dilutionVolume * scalingFactor;
            scaledRecipe += `<li>${scaledDilutionNum.toFixed(2)} oz/${(scaledDilutionNum * 29.5735).toFixed(2)} ml water</li>`;
        }

        scaledRecipe += '</ul>';

        const containerValue = parseFloat(document.getElementById("container-value").value);
        const containerUnit = document.getElementById("container-unit").value;

        if (!isNaN(containerValue) && containerValue > 0) {
            const totalBatchOz = finalTotalVolume * scalingFactor;
            const containerOz = convertToOunces(containerValue, containerUnit);
            const containerCount = (totalBatchOz / containerOz).toFixed(1);
            const containerUnitLabels = {
                'oz': 'oz',
                'ml': 'ml',
                'l': 'liter',
                'gal': 'gallon'
            };
            const containerLabel = containerUnitLabels[containerUnit] || containerUnit;
            scaledRecipe += `<p class="yield-line"><strong>Yield:</strong> ${containerCount} &times; ${containerValue} ${containerLabel} containers</p>`;
        }

        const instructions = document.getElementById("recipe-instructions").value.trim();
        if (instructions !== '') {
            scaledRecipe += `<h5 class="recipe-notes">Recipe Notes</h5><p id="instructions">${instructions}</p>`;
        }

        // Display results and show the results section
        originalRecipeDisplay.innerHTML = originalRecipe;
        scaledRecipeDisplay.innerHTML = scaledRecipe;
        resultsSection.style.display = 'block';

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Handle the print recipe functionality
    printRecipeButton.onclick = () => {
        window.print();
    };

    // Notes section textarea behavior
    const instructionsInput = document.getElementById("recipe-instructions");
    const charCount = document.getElementById("char-count");
    const maxChars = instructionsInput.maxLength;

    // Prevent carriage returns in the textarea
    instructionsInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });

    // Update character count
    instructionsInput.addEventListener("input", function () {
        const remaining = maxChars - instructionsInput.value.length;
        charCount.textContent = `${remaining} characters remaining`;
    });

    // Initialize with one ingredient input
    addIngredient();
});
