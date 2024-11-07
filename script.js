let historyStack = [];
let isUndoing = false;

document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('data-table');
    const inputs = table.getElementsByTagName('input');
    Array.from(inputs).forEach(input => {
        input.addEventListener('paste', handlePaste);
        input.addEventListener('input', saveState);
    });
});

document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'z') {
        undo();
    }
});

function saveState() {
    if (!isUndoing) {
        const tableState = getTableState();
        historyStack.push(tableState);
    }
}

function getTableState() {
    const table = document.getElementById('data-table');
    const rows = table.getElementsByTagName('tbody')[0].rows;
    return Array.from(rows).map(row =>
        Array.from(row.cells).map(cell => cell.getElementsByTagName('input')[0].value)
    );
}

function setTableState(state) {
    const table = document.getElementById('data-table');
    const rows = table.getElementsByTagName('tbody')[0].rows;
    state.forEach((rowData, rowIndex) => {
        rowData.forEach((cellData, cellIndex) => {
            if (rowIndex < rows.length && cellIndex < rows[rowIndex].cells.length) {
                rows[rowIndex].cells[cellIndex].getElementsByTagName('input')[0].value = cellData;
            }
        });
    });
}

function undo() {
    if (historyStack.length > 0) {
        isUndoing = true;
        const lastState = historyStack.pop();
        setTableState(lastState);
        isUndoing = false;
    }
}

function handlePaste(event) {
    saveState(); // Save state before paste

    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text').trim();
    const rowsData = pastedData.split(/\s+/).reduce((acc, value, index) => {
        const rowIndex = Math.floor(index / 8);
        if (!acc[rowIndex]) acc[rowIndex] = [];
        acc[rowIndex].push(value);
        return acc;
    }, []);

    const input = event.target;
    const startRowIndex = input.parentElement.parentElement.rowIndex - 1; // Adjust for tbody
    const startCellIndex = input.parentElement.cellIndex;
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];

    rowsData.forEach((rowData, rowIndex) => {
        let row;
        if (startRowIndex + rowIndex < table.rows.length) {
            row = table.rows[startRowIndex + rowIndex];
        } else {
            row = table.insertRow();
            for (let i = 0; i < table.rows[0].cells.length; i++) {
                const newCell = row.insertCell();
                const newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.addEventListener('paste', handlePaste); // Add paste event
                newInput.addEventListener('input', saveState); // Add input event
                newCell.appendChild(newInput);
            }
        }
        rowData.forEach((cellData, cellIndex) => {
            if (startCellIndex + cellIndex < row.cells.length) {
                row.cells[startCellIndex + cellIndex].getElementsByTagName('input')[0].value = cellData;
            }
        });
    });

    saveState(); // Save state after paste
    event.preventDefault();
}

function addRow() {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        const newCell = newRow.insertCell();
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.addEventListener('paste', handlePaste); // Add paste event
        newInput.addEventListener('input', saveState); // Add input event
        newCell.appendChild(newInput);
    }
    saveState(); // Save state after adding a row
}

function exportData() {
    const table = document.getElementById('data-table');
    const rows = table.getElementsByTagName('tbody')[0].rows;
    let xmlData = '';

    for (let row of rows) {
        const values = Array.from(row.cells).map(cell => cell.getElementsByTagName('input')[0].value.trim());

        // Check if any value is empty
        if (values.some(value => value === '')) {
            continue; // Skip this row if any cell is empty
        }

        const uidMd = formatNumber(values[0]);
        const tvd = formatNumber(values[1]);
        const incl = formatNumber(values[2]);
        const azi = formatNumber(values[3]);
        const dispNs = formatNumber(values[4]);
        const dispEw = formatNumber(values[5]);
        const vertSect = formatNumber(values[6]);
        const dls = formatNumber(values[7]);
        xmlData += `
<trajectoryStation uid="Traj-${uidMd}">
    <typeTrajStation>unknown</typeTrajStation>
    <md uom="m">${uidMd}</md>
    <tvd uom="m">${tvd}</tvd>
    <incl uom="dega">${incl}</incl>
    <azi uom="dega">${azi}</azi>
    <dispNs uom="m">${dispNs}</dispNs>
    <dispEw uom="m">${dispEw}</dispEw>
    <vertSect uom="m">${vertSect}</vertSect>
    <dls uom="dega/30m">${dls}</dls>
</trajectoryStation>`;
    }

    document.getElementById('output').textContent = xmlData;

    // Show the copy button after exporting
    document.getElementById('copy-button').style.display = 'inline-block';
}

function formatNumber(value) {
    const number = parseFloat(value.replace(/,/g, ''));
    return number % 1 === 0 ? number.toFixed(0) : number.toFixed(2);
}

function copyToClipboard() {
    const output = document.getElementById('output');
    const range = document.createRange();
    range.selectNodeContents(output);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
        alert('XML copiado al portapapeles');
    } catch (err) {
        alert('Error al copiar el XML');
    }

    selection.removeAllRanges();
}

