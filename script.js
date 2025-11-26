const state = {
    people: [],
    items: []
};

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Simple split
const simpleBillInput = document.getElementById('simple-bill');
const simpleTaxInput = document.getElementById('simple-tax');
const simpleTipInput = document.getElementById('simple-tip');
const simplePeopleInput = document.getElementById('simple-people');
const simpleCalcBtn = document.getElementById('simple-calc-btn');
const simpleResults = document.getElementById('simple-results');

document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        simpleTipInput.value = this.dataset.tip;
        document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

simpleCalcBtn.addEventListener('click', function() {
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

// Itemized split
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

addPersonBtn.addEventListener('click', function() {
    const name = personNameInput.value.trim();
    if (!name) {
        alert('Enter a person name');
        return;
    }
    if (state.people.some(p => p.name === name)) {
        alert('Person already added');
        return;
    }
    state.people.push({ name: name });
    personNameInput.value = '';
    renderPeopleList();
});

addItemBtn.addEventListener('click', function() {
    const name = itemNameInput.value.trim();
    const price = parseFloat(itemPriceInput.value) || 0;
    if (!name || price <= 0) {
        alert('Enter valid item name and price');
        return;
    }
    state.items.push({
        id: Date.now(),
        name: name,
        price: price,
        assignedTo: []
    });
    itemNameInput.value = '';
    itemPriceInput.value = '';
    renderItemsList();
});

function renderPeopleList() {
    peopleList.innerHTML = '';
    state.people.forEach((person, idx) => {
        const div = document.createElement('div');
        div.className = 'person-item';
        div.innerHTML = '<span>' + person.name + '</span><button class="remove-btn" onclick="removePerson(' + idx + ')">Remove</button>';
        peopleList.appendChild(div);
    });
}

function renderItemsList() {
    itemsList.innerHTML = '';
    state.items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'item-row';
        let html = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;"><div><strong>' + item.name + '</strong><span style="color: #7f8c8d; font-size: 0.9rem; margin-left: 1rem;">' + formatCurrency(item.price) + '</span></div><button class="remove-btn" onclick="removeItem(' + item.id + ')">Remove</button></div><div style="margin-top: 0.5rem;"><small style="color: #7f8c8d;">Assign to:</small><div class="item-people-checkboxes">';
        state.people.forEach((person) => {
            const checked = item.assignedTo.includes(person.name) ? 'checked' : '';
            html += '<label class="checkbox-label"><input type="checkbox" ' + checked + ' onchange="toggleItemAssignment(' + item.id + ', \'' + person.name + '\')"> ' + person.name + '</label>';
        });
        html += '</div></div>';
        div.innerHTML = html;
        itemsList.appendChild(div);
    });
}

window.toggleItemAssignment = function(itemId, personName) {
    const item = state.items.find(i => i.id === itemId);
    if (item) {
        const idx = item.assignedTo.indexOf(personName);
        if (idx >= 0) {
            item.assignedTo.splice(idx, 1);
        } else {
            item.assignedTo.push(personName);
        }
        renderItemsList();
    }
};

window.removePerson = function(index) {
    const removedName = state.people[index].name;
    state.people.splice(index, 1);
    state.items.forEach(item => {
        item.assignedTo = item.assignedTo.filter(p => p !== removedName);
    });
    renderPeopleList();
    renderItemsList();
};

window.removeItem = function(itemId) {
    state.items = state.items.filter(i => i.id !== itemId);
    renderItemsList();
};

itemizedCalcBtn.addEventListener('click', function() {
    if (state.people.length === 0) {
        alert('Add at least one person');
        return;
    }
    if (state.items.length === 0) {
        alert('Add at least one item');
        return;
    }
    
    const taxPercent = parseFloat(itemizedTaxInput.value) || 0;
    const tipPercent = parseFloat(itemizedTipInput.value) || 0;
    const subtotal = state.items.reduce((sum, item) => sum + item.price, 0);
    const personShares = {};
    
    state.people.forEach(person => {
        personShares[person.name] = 0;
    });
    
    for (let i = 0; i < state.items.length; i++) {
        if (state.items[i].assignedTo.length === 0) {
            alert('Assign all items to someone');
            return;
        }
    }
    
    state.items.forEach(item => {
        const perPerson = item.price / item.assignedTo.length;
        item.assignedTo.forEach(personName => {
            personShares[personName] += perPerson;
        });
    });
    
    const tax = (subtotal * taxPercent) / 100;
    const tip = ((subtotal + tax) * tipPercent) / 100;
    
    itemizedBreakdown.innerHTML = '';
    state.people.forEach(person => {
        const personSubtotal = personShares[person.name];
        const proportion = personSubtotal / subtotal;
        const personTax = tax * proportion;
        const personTip = tip * proportion;
        const personTotal = personSubtotal + personTax + personTip;
        
        const div = document.createElement('div');
        div.className = 'person-breakdown';
        div.innerHTML = '<h5>' + person.name + '</h5><div class="breakdown-item"><span>Subtotal:</span><span>' + formatCurrency(personSubtotal) + '</span></div><div class="breakdown-item"><span>Tax (' + taxPercent + '%):</span><span>' + formatCurrency(personTax) + '</span></div><div class="breakdown-item"><span>Tip (' + tipPercent + '%):</span><span>' + formatCurrency(personTip) + '</span></div><div class="person-total"><span>Total:</span><span>' + formatCurrency(personTotal) + '</span></div>';
        itemizedBreakdown.appendChild(div);
    });
    
    document.getElementById('itemized-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('itemized-tax-amount').textContent = formatCurrency(tax);
    document.getElementById('itemized-tip-amount').textContent = formatCurrency(tip);
    document.getElementById('itemized-grand-total').textContent = formatCurrency(subtotal + tax + tip);
    
    itemizedResults.classList.remove('hidden');
});