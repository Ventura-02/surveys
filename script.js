let historyStack = [];
let isUndoing = false;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('handsontable-container');
    const hot = new Handsontable(container, {
        data: [[]],
        colHeaders: ['uid/md', 'tvd', 'incl', 'azi', 'dispNs', 'dispEw', 'vertSect', 'dls'],
        columns: Array(8).fill({ type: 'numeric' }),
        minSpareRows: 1,
        rowHeaders: true,
        contextMenu: true,
        licenseKey: 'non-commercial-and-evaluation'
    });

    document.getElementById('export').addEventListener('click', () => {
        const data = hot.getData();
        let xmlData = '';

        data.forEach(row => {
            if (row.some(cell => cell === null || cell === '')) return;

            const [uidMd, tvd, incl, azi, dispNs, dispEw, vertSect, dls] = row.map(formatNumber);
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
        });

        document.getElementById('output').textContent = xmlData;
        document.getElementById('copy-button').style.display = 'inline-block';
    });
});

function formatNumber(value) {
    // Remove commas from the number string
    const numberString = value.toString().replace(/,/g, '');
    const number = parseFloat(numberString);
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
