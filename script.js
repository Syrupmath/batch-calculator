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

    let ingredientCount = 0;

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
        ingredientCount++;
    }

    // Event delegation for removing ingredients
    ingredientList.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-danger')) {
            event.target.parentElement.parentElement.remove();
            ingredientCount--;
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
                return true; // Found a valid ingredient
            }
        }
        return false; // No valid ingredient found
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
        resultsDrinkName.textContent = recipeName; // Display Recipe Name in results section

        const scalingOption = document.querySelector("input[name='scaling-option']:checked").value;

        // Display the original recipe without the drink name
        let originalRecipe = '';
        let totalVolume = 0;

        const ingredients = document.querySelectorAll('#ingredient-list li');
        ingredients.forEach(ingredient => {
            const name = ingredient.querySelector('.ingredient-name').value.trim();
            const quantity = parseFloat(ingredient.querySelector('.ingredient-quantity').value);
            const unit = ingredient.querySelector('.ingredient-unit').value;

            if (name !== '' && !isNaN(quantity) && quantity > 0 && unit !== '') {
                const quantityInOunces = convertToOunces(quantity, unit);
                totalVolume += quantityInOunces;
                originalRecipe += `${quantity} ${unit} ${name}\n`;
            }
        });

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

        // Set the Scaled Recipe header with dynamic information
        scaledRecipeHeader.textContent = `Scaled Recipe`;

        // Display the scaled recipe without the drink name
        let scaledRecipe = '';

        ingredients.forEach(ingredient => {
            const name = ingredient.querySelector('.ingredient-name').value.trim();
            const quantity = parseFloat(ingredient.querySelector('.ingredient-quantity').value);
            const unit = ingredient.querySelector('.ingredient-unit').value;

            if (name !== '' && !isNaN(quantity) && quantity > 0 && unit !== '') {
                const quantityInOunces = convertToOunces(quantity, unit);
                const scaledQuantity = (quantityInOunces * scalingFactor).toFixed(2);
                scaledRecipe += `${scaledQuantity} oz (${(scaledQuantity * 29.5735).toFixed(2)} ml) ${name}\n`;
            }
        });

        if (dilution > 0) {
            originalRecipe += `${dilutionVolume.toFixed(2)} oz Water (Dilution)\n`;
            const scaledDilutionVolume = (dilutionVolume * scalingFactor).toFixed(2);
            scaledRecipe += `${scaledDilutionVolume} oz (${(scaledDilutionVolume * 29.5735).toFixed(2)} ml) Water\n`;
        }

        // Display results and show the results section
        originalRecipeDisplay.textContent = originalRecipe;
        scaledRecipeDisplay.textContent = scaledRecipe;
        resultsSection.style.display = 'block';
    };

    // Handle the print recipe functionality
    printRecipeButton.onclick = () => {
        window.print    };

    // Handle the print recipe functionality
    printRecipeButton.onclick = () => {
        window.print();
    };

    // Initialize with one ingredient input
    addIngredient();
});
