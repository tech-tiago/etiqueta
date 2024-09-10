// Função para buscar localizações e popular o campo select
function fetchLocalizacoes() {
    fetch('/api/localizacoes') // Altere para a sua rota de API
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('localizacaoSelect');
            data.forEach(localizacao => {
                const option = document.createElement('option');
                option.value = localizacao.id;
                option.text = localizacao.nome;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Erro ao buscar localizações:', error));
}

// Função para buscar itens por localização
function fetchItemsByLocation(localizacaoId) {
    let url = '/api/items';
    if (localizacaoId) {
        url += `?localizacao_id=${localizacaoId}`;
    }

    console.log(`Fetching items from URL: ${url}`); // Depuração

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Items fetched:', data); // Depuração
            populateReportTable(data);
        })
        .catch(error => console.error('Erro ao buscar itens:', error));
}

// Função para buscar itens para o relatório
function fetchItemsForReport(localizacaoId) {
    let url = '/api/items';
    if (localizacaoId) {
        url += `?localizacao_id=${localizacaoId}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            openPrintWindow(data);
        })
        .catch(error => console.error('Erro ao buscar itens:', error));
}

// Função para preencher a tabela com os dados
function populateReportTable(items) {
    const tableBody = document.querySelector('#reportTable tbody');
    tableBody.innerHTML = ''; // Limpar tabela antes de inserir os novos itens

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.codItems}</td>
            <td>${item.tombo}</td>
            <td>${item.itemName}</td>
            <td>${item.entryDate}</td>
            <td>${item.localizacaoNome}</td>
            <td>${item.description}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para abrir uma janela de impressão com o relatório
function openPrintWindow(items) {
    const printWindow = window.open('', '_blank');
    const tableContent = items.map(item => `
        <tr>
            <td>${item.codItems}</td>
            <td>${item.tombo}</td>
            <td>${item.itemName}</td>
            <td>${item.entryDate}</td>
            <td>${item.localizacaoNome}</td>
            <td>${item.description}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <html>
            <head>
                <title>Relatório de Itens</title>
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 9px; /* Define o tamanho da fonte para 9px */
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>Relatório de Itens</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Tombo</th>
                            <th>Nome do Item</th>
                            <th>Data de Entrada</th>
                            <th>Localização</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableContent}
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
        </html>
    `);
}

// Atualiza automaticamente a tabela ao selecionar uma localização
document.getElementById('localizacaoSelect').addEventListener('change', function () {
    const localizacaoId = this.value;
    console.log('Selected localizacaoId:', localizacaoId); // Depuração
    fetchItemsByLocation(localizacaoId);
});

// Função para gerar relatório por localização em uma janela de impressão
document.getElementById('generateLocationReportButton').addEventListener('click', function () {
    const localizacaoId = document.getElementById('localizacaoSelect').value;
    if (localizacaoId) {
        fetchItemsForReport(localizacaoId);
    } else {
        alert('Selecione uma localização para gerar o relatório.');
    }
});

// Função para gerar relatório geral em uma janela de impressão
document.getElementById('generateAllItemsReportButton').addEventListener('click', function () {
    fetchItemsForReport(null);
});

// Inicializar a página
document.addEventListener('DOMContentLoaded', function () {
    fetchLocalizacoes();
    fetchItemsByLocation(null); // Carrega todos os itens inicialmente
});
