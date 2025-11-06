const anickaImage = document.querySelector('#anicka-image');
const vojtechImage = document.querySelector('#vojtech-image');

const anickaScore = document.querySelector('#anicka-score');
const vojtechScore = document.querySelector('#vojtech-score');

const anickaMinus = document.querySelector('#anicka-minus-button');
const anickaPlus = document.querySelector('#anicka-plus-button');
const anickaInput = document.querySelector('#anicka-input');
const vojtechPlus = document.querySelector('#vojtech-plus-button');
const vojtechMinus = document.querySelector('#vojtech-minus-button');
const vojtechInput = document.querySelector('#vojtech-input');

const confirmButton = document.querySelector('#confirm-button');

// Function to update images based on scores
function updateImages() {
    if (Number(anickaScore.textContent) > Number(vojtechScore.textContent)) {
        anickaImage.src = 'images/anicka-happy.png';
        vojtechImage.src = 'images/vojtech-sad.png';
    } else if (Number(anickaScore.textContent) < Number(vojtechScore.textContent)) {
        anickaImage.src = 'images/anicka-sad.png';
        vojtechImage.src = 'images/vojtech-happy.png';
    } else {
        anickaImage.src = 'images/anicka-even.png';
        vojtechImage.src = 'images/vojtech-even.png';
    }
}

const API_BASE_URL = window.API_BASE_URL || '';

// Load scores from API
async function loadScores() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scores`);
        if (!response.ok) throw new Error('Failed to load scores');
        const data = await response.json();
        anickaScore.textContent = data.anicka;
        vojtechScore.textContent = data.vojtech;
        updateImages();
    } catch (error) {
        console.error('Error loading scores:', error);
    }
}

async function updateScores(anickaIncrement, vojtechIncrement) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                anicka: anickaIncrement,
                vojtech: vojtechIncrement
            })
        });
        if (!response.ok) throw new Error('Failed to update scores');
        loadScores();
        updateImages();
    } catch (error) {
        console.error('Error updating scores:', error);
        loadScores();
    }
}

// Load scores on page load
loadScores();

// Button event listeners
anickaPlus.addEventListener('click', () => {
    if (Number(anickaInput.value) < 100) {
        anickaInput.value = Number(anickaInput.value) + 1;
    }
});

anickaMinus.addEventListener('click', () => {
    if (Number(anickaInput.value) > 0) { 
        anickaInput.value = Number(anickaInput.value) - 1;
    }
});

vojtechPlus.addEventListener('click', () => {
    if (Number(vojtechInput.value) < 100) {
        vojtechInput.value = Number(vojtechInput.value) + 1;
    }
});

vojtechMinus.addEventListener('click', () => {
    if (Number(vojtechInput.value) > 0) { 
        vojtechInput.value = Number(vojtechInput.value) - 1;
    }
});

// Confirm button - update scores via API
confirmButton.addEventListener('click', async () => {
    const anickaIncrement = Number(anickaInput.value);
    const vojtechIncrement = Number(vojtechInput.value);
    
    // Reset inputs
    anickaInput.value = 0;
    vojtechInput.value = 0;
    
    updateScores(anickaIncrement, vojtechIncrement);
});