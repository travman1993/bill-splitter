const state = {
    people: [],
    items: []
};

// Mode Switching
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const modeElement = document.getElementById(`${mode}-mode`);
        if (modeElement) {
            modeElement.classList.add('active');
        }
    });
});

// SIMPLE SPLIT LOGIC
const simpleBillInput = document.getElementById('simple-bill');
const simpleTaxInput = document.getElementById('simple-tax');
const simpleTipInput = document.getElementById('simple-tip');
const simplePeopleInput = document.getElementById('simple-people');
const simpleCalcBtn = document.getElementById('simple-calc-btn');
const simpleResults = document.getElementById('simple-results');

document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tipValue = btn.dataset.tip;
        simpleTipInput.value = tipValue;
        
        document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

simpleTipInput.addEventListener('input', () => {
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tip === simpleTipInput.value) {
            btn.classList.add('active');
        }
    });
});

simpleCalcBtn.addEventListener('click', () => {
    const bill = parseFloat(simpleBillInput.value) || 0;
    const taxPercent = parseFloat(simpleTaxInput.value) || 0;
    const tipPercent = parseFloat(simpleTipInput.value) || 0;
    const people = parseInt(simplePeopleInput.value) || 1;
    
    if (bill <= 0 || people <= 0) {
        alert('Please enter valid amounts.');
        return;
    }
    
    const tax = (bill * taxPercent) / 100;
    const subtotalWithTax = bill + tax;
    const tip = (subtotalWithTax * tipPercent) / 100;
    const grandTotal = subtotalWithTax + tip;
    const perPerson = grandTotal / people;
    
    document.getElementById('simple-subtotal').textContent = formatCurrency(bill);
    document.getElementById('simple-tax-amount').textContent = formatCurrency(tax);
    document.getElementById('simple-tip-amount').textContent = formatCurrency(tip);
    document.getElementById('simple-grand-total').textContent = formatCurrency(grandTotal);
    document.getElementById('simple-per-person').textContent = formatCurrency(perPerson);
    
    simpleResults.classList.remove('hidden');
});

// ITEMIZED SPLIT LOGIC
const addPersonBtn = document.getElementById('add-person-btn');
const personNameInput = document.getElementById('person-name');
const peopleList = document.getElementById('people-list');

const addItemBtn = document.getElementById('add-item-btn');
const itemNameInput = document.getElementById('item-name');
const itemPriceInput = document.getElementById('item-price');
const itemsList = document.getElementById('items-list');

const itemizedTaxInput = document.getElementById('itemized-tax');
const itemizedTipInput = document.getElementById('itemized-tip');
const itemizedCalcBtn = document.getElementById('itemized-calc-btn');
const itemizedResults = document.getElementById('itemized-results');
const itemizedBreakdown = document.getElementById('itemized-breakdown');

addPersonBtn.addEventListener('click', () => {
    const name = personNameInput.value.trim();
    if (!name) {
        alert('Please enter a person\'s name.');
        return;
    }
    
    if (state.people.some(p => p.name === name)) {
        alert('This person is already added.');
        return;
    }
    
    state.people.push({ name });
    personNameInput.value = '';
    renderPeopleList();
});

addItemBtn.addEventListener('click', () => {
    const name = itemNameInput.value.trim();
    const price = parseFloat(itemPriceInput.value) || 0;
    
    if (!name || price <= 0) {
        alert('Please enter a valid item name and price.');
        return;
    }
    
    const itemId = Date.now();
    state.items.push({
        id: itemId,
        name,
        price,
        assignedTo: []
    });
    
    itemNameInput.value = '';
    itemPriceInput.value = '';
    renderItemsList();
});

function renderPeopleList() {
    peopleList.innerHTML = '';
    state.people.forEach((person, index) => {
        const div = document.createElement('div');
        div.className = 'person-item';
        div.innerHTML = `
            <span>${person.name}</span>
            <button class="remove-btn" onclick="removePerson(${index})">Remove</button>
        `;
        peopleList.appendChild(div);
    });
}

function renderItemsList() {
    itemsList.innerHTML = '';
    state.items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'item-row';
        
        let checkboxesHTML = '<div class="item-people-checkboxes" style="width: 100%; margin-top: 0.5rem;">';
        state.people.forEach((person) => {
            const isChecked = item.assignedTo.includes(person.name) ? 'checked' : '';
            checkboxesHTML += `
                <label class="checkbox-label">
                    <input type="checkbox" ${isChecked} onchange="toggleItemAssignment(${item.id}, '${person.name}')">
                    ${person.name}
                </label>
            `;
        });
        checkboxesHTML += '</div>';
        
        div.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span><strong>${item.name}</strong></span>
                    <span>${formatCurrency(item.price)}</span>
                </div>
                ${checkboxesHTML}
            </div>
            <button class="remove-btn" style="white-space: nowrap; margin-left: 1rem;" onclick="removeItem(${item.id})">Remove</button>
        `;
        itemsList.appendChild(div);
    });
}

window.toggleItemAssignment = function(itemId, personName) {
    const item = state.items.find(i => i.id === itemId);
    if (item) {
        if (item.assignedTo.includes(personName)) {
            item.assignedTo = item.assignedTo.filter(p => p !== personName);
        } else {
            item.assignedTo.push(personName);
        }
        renderItemsList();
    }
};

window.removePerson = function(index) {
    state.people.splice(index, 1);
    state.items.forEach(item => {
        item.assignedTo = item.assignedTo.filter(p => p !== state.people[index]?.name);
    });
    renderPeopleList();
    renderItemsList();
};

window.removeItem = function(itemId) {
    state.items = state.items.filter(i => i.id !== itemId);
    renderItemsList();
};

itemizedCalcBtn.addEventListener('click', () => {
    if (state.people.length === 0) {
        alert('Please add at least one person.');
        return;
    }
    
    if (state.items.length === 0) {
        alert('Please add at least one item.');
        return;
    }
    
    const taxPercent = parseFloat(itemizedTaxInput.value) || 0;
    const tipPercent = parseFloat(itemizedTipInput.value) || 0;
    
    const subtotal = state.items.reduce((sum, item) => sum + item.price, 0);
    const personShares = {};
    
    state.people.forEach(person => {
        personShares[person.name] = 0;
    });
    
    state.items.forEach(item => {
        if (item.assignedTo.length === 0) {
            alert(`Item "${item.name}" is not assigned to anyone.`);
            return;
        }
        
        const sharePerPerson = item.price / item.assignedTo.length;
        item.assignedTo.forEach(person => {
            personShares[person.name] += sharePerPerson;
        });
    });
    
    const tax = (subtotal * taxPercent) / 100;
    const tip = ((subtotal + tax) * tipPercent) / 100;
    
    itemizedBreakdown.innerHTML = '';
    state.people.forEach(person => {
        const subtotalShare = personShares[person.name];
        const proportion = subtotalShare / subtotal;
        const taxShare = tax * proportion;
        const tipShare = tip * proportion;
        const totalShare = subtotalShare + taxShare + tipShare;
        
        const div = document.createElement('div');
        div.className = 'person-breakdown';
        div.innerHTML = `
            <h5>${person.name}</h5>
            <div class="breakdown-item">
                <span>Subtotal:</span>
                <span>${formatCurrency(subtotalShare)}</span>
            </div>
            <div class="breakdown-item">
                <span>Tax (${taxPercent}%):</span>
                <span>${formatCurrency(taxShare)}</span>
            </div>
            <div class="breakdown-item">
                <span>Tip (${tipPercent}%):</span>
                <span>${formatCurrency(tipShare)}</span>
            </div>
            <div class="person-total">
                <span>Total:</span>
                <span>${formatCurrency(totalShare)}</span>
            </div>
        `;
        itemizedBreakdown.appendChild(div);
    });
    
    document.getElementById('itemized-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('itemized-tax-amount').textContent = formatCurrency(tax);
    document.getElementById('itemized-tip-amount').textContent = formatCurrency(tip);
    document.getElementById('itemized-grand-total').textContent = formatCurrency(subtotal + tax + tip);
    
    itemizedResults.classList.remove('hidden');
});

// UTILITIES
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}