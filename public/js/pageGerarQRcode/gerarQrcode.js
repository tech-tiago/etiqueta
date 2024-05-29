document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    let navbarBurger = document.querySelector('.navbar-burger');

    if (navbarBurger) {
        navbarBurger.addEventListener('click', function () {
            this.classList.toggle('is-active');
            document.getElementById(this.dataset.target).classList.toggle('is-active');
        });
    } else {
        console.error("Elemento .navbar-burger não encontrado");
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const searchValue = this.value;
            fetchAndDisplayItems(searchValue);
        });
    }

    const addItemForm = document.getElementById("itemForm");
    if (addItemForm) {
        addItemForm.addEventListener("submit", function (event) {
            event.preventDefault();
            addItem();
        });
    }

    fetchAndDisplayItems();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        fetchItemInfo(id);
    }

    // Atualize a função deleteLocation para deleteItem
    function deleteItem(id) {
        fetch(`/items/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir item');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Item ${id} excluído com sucesso`);
            fetchAndDisplayItems(); // Atualiza a tabela após a exclusão
        })
        .catch(error => {
            console.error('Erro ao excluir item:', error);
        });
    }


    function fetchAndDisplayItems(search = "", ids = []) {
        let apiUrl = `/items`;
        if (search) {
            apiUrl += `?search=${search}`;
        } else if (ids.length > 0) {
            apiUrl += `?ids=${ids.join(',')}`;
        }
        document.body.classList.add('loading');
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.items && Array.isArray(data.items)) {
                    displayItemsInTable(data.items);
                } else {
                    console.error("Formato de dados inesperado:", data);
                }
            })
            .catch(error => {
                console.error("Erro ao buscar itens:", error);
            })
            .finally(() => {
                document.body.classList.remove('loading');
            });
    }

    function displayItemsInTable(items) {
        const tableId = '#historyTable';

        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().clear().destroy();
        }

        $(tableId).empty();

        const table = $(tableId).DataTable({
            paging: true,
            searching: true,
            pageLength: 10,
            "bLengthChange": false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
            },
            data: items,
            columns: [
                {
                    data: null,
                    title: '#',
                    render: function (data, type, row) {
                        return `<input type="checkbox" class="select-item-checkbox" data-id="${row.id}">`;
                    }
                },
                { data: 'codItems', title: 'Código' },
                { data: 'tombo', title: 'Tombo' },
                { data: 'itemName', title: 'Nome do Item' },
                {
                    data: 'entryDate',
                    title: 'Data de Entrada',
                    render: function (data, type, row) {
                        return formatDateToPTBR(data);
                    }
                },
                { data: 'location', title: 'Localização' },
                { data: 'description', title: 'Descrição' },
                {
                    data: null,
                    title: 'Gerar QRcode',
                    render: function (data, type, row) {
                        return '<button class="button is-small is-info generate-qr-button"><i class="fa-solid fa-qrcode"></i>&nbsp;Gerar</button>';
                    }
                },
                {
                    data: null,
                    title: 'Editar',
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="buttons is-grouped">
                                <div class="button is-small is-warning edit-item-button"><i class="fa-solid fa-pencil"></i>&nbsp;Editar</div>
                                <div class="button is-small is-danger delete-item-button" data-id="${row.id}"><i class="fa-solid fa-trash"></i>&nbsp;Excluir</div>
                            </div>`;
                    }
                }
            ]            
        });

        $('#historyTable tbody').on('click', '.generate-qr-button', function () {
            const data = table.row($(this).parents('tr')).data();
            showQRCodeModal(data);
        });

        $('#historyTable tbody').on('click', '.edit-item-button', function () {
            const data = table.row($(this).parents('tr')).data();
            showEditItemModal(data);
        });

        // Evento para atualizar o botão de impressão
        $('#historyTable tbody').on('change', '.select-item-checkbox', function () {
            const itemId = $(this).data('id');
            toggleSelectedItem(itemId);
        });

        // Evento para botões de exclusão na tabela
        $('#historyTable tbody').on('click', '.delete-item-button', function () {
            const id = $(this).data('id');
            showDeleteConfirmationModal(id);
        });

    };

    
    function formatDateToPTBR(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Variável global para armazenar os IDs dos itens selecionados
    let selectedItems = [];

    // Função para adicionar ou remover um item da lista de selecionados
    function toggleSelectedItem(itemId) {
        const index = selectedItems.indexOf(itemId);
        if (index === -1) {
            selectedItems.push(itemId);
        } else {
            selectedItems.splice(index, 1);
        }
        updatePrintButton();
    }

    // Função para atualizar o botão de impressão
    function updatePrintButton() {
        const selectedItemsCount = selectedItems.length;
        const printButtonContainer = document.getElementById('printButtonContainer');
        if (selectedItemsCount > 0) {
            printButtonContainer.innerHTML = `<button id="printSelectedItemsButton" class="button is-warning is-small"><i class="fa-solid fa-check-double"></i>&nbsp;Imprimir etiquetas selecionadas (${selectedItemsCount})</button>`;
            document.getElementById('printSelectedItemsButton').addEventListener('click', function () {
                printSelectedItems();
            });
        } else {
            printButtonContainer.innerHTML = '';
        }
    }

    // Função para imprimir os itens selecionados
    function printSelectedItems() {
        if (selectedItems.length > 0) {
            fetchSelectedItems(selectedItems);
        } else {
            alert('Selecione pelo menos um item para imprimir.');
        }
    }

    // Função para buscar os itens selecionados
    function fetchSelectedItems(ids) {
        let apiUrl = `/items?ids=${ids.join(',')}`;
        document.body.classList.add('loading');
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.items && Array.isArray(data.items)) {
                    const selectedItems = data.items.filter(item => ids.includes(item.id));
                    openPrintWindow(selectedItems);
                } else {
                    console.error("Formato de dados inesperado:", data);
                }
            })
            .catch(error => {
                console.error("Erro ao buscar itens:", error);
            })
            .finally(() => {
                document.body.classList.remove('loading');
            });
    }

    // Função para mostrar o modal de confirmação de exclusão
function showDeleteConfirmationModal(id) {
    // Busca os dados do item para mostrar no modal de confirmação
    fetch(`/items/${id}`)
        .then(response => response.json())
        .then(item => {
            const modal = createElement('div', { className: 'modal is-active' },
                createElement('div', { className: 'modal-background' }),
                createElement('div', { className: 'modal-card' },
                    createElement('header', { className: 'modal-card-head' },
                        createElement('p', { className: 'modal-card-title' }, 'Confirmar Exclusão'),
                        createElement('button', { className: 'delete', 'aria-label': 'close' })
                    ),
                    createElement('section', { className: 'modal-card-body' },
                        createElement('p', {}, `Você tem certeza que deseja excluir o item ${item.codItems}?`)
                    ),
                    createElement('footer', { className: 'modal-card-foot' },
                        createElement('button', { className: 'button is-danger', id: 'confirmDeleteButton' }, 'Excluir'),
                        createElement('button', { className: 'button', id: 'cancelDeleteButton' }, 'Cancelar')
                    )
                )
            );

            document.body.appendChild(modal);

            const confirmDeleteButton = document.getElementById('confirmDeleteButton');
            const cancelDeleteButton = document.getElementById('cancelDeleteButton');
            const closeButton = modal.querySelector('.delete');

            confirmDeleteButton.addEventListener('click', function () {
                deleteItem(item.id); // Chama a função de exclusão
                document.body.removeChild(modal);
            });

            cancelDeleteButton.addEventListener('click', function () {
                document.body.removeChild(modal);
            });

            closeButton.addEventListener('click', function () {
                document.body.removeChild(modal);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar item para exclusão:', error);
        });
}

// Função para abrir a janela de impressão
function openPrintWindow(selectedItems) {
    const itemsPerPage = 48; // Defina a quantidade de itens por página
    const numberOfPages = Math.ceil(selectedItems.length / itemsPerPage);
    const printWindow = window.open('', '_blank');
    
    let printContent = `
        <html>
        <head>
            <title>Imprimir Etiquetas</title>
            <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css'> 
            <style>
                .a4-size {
                    width: 210mm;
                    height: 297mm;
                    display: flex;
                    flex-wrap: wrap;
                    align-content: flex-start;
                    padding: 3.85mm;
                    background-color: white;
                    overflow: hidden;
                    page-break-after: always;
                }
                .grid-item {
                    -webkit-print-color-adjust: exact;
                    width: 185px;
                    height: 85px;
                    border-radius: 10px;
                    border: 1px solid black;
                    margin: 3px;
                    position: relative;
                }
                .tombo-info, .local-info, .qr-code, .ip-info, .data-info, .cod-info {
                    font-weight: bold;
                    font-size: 7px;
                    position: absolute;
                }
                .tombo-info {
                    top: 1px;
                    left: 5px;
                }
                .local-info {
                    top: 67px;
                    left: 5px;
                }
                .logo {
                    width: 120px;
                    height: 65px;
                    position: absolute;
                    top: 15px;
                    left: -5px;
                }
                .quadrado {
                    width: 68px;
                    height: 66px;
                    border: 1px solid;
                    border-radius: 4px;
                    border-color: #000;
                    position: absolute;
                    background-color: #fff;
                    top: 12px;
                    right: 7px;
                }
                .qr-code {
                    top: 14px;
                    right: 10px;
                }
                .ip-info {
                    top: 1px;
                    right: 126px;
                }
                .data-info {
                    top: 1px;
                    right: 60px;
                }
                .cod-info {
                    top: 65px;
                    right: 110px;
                }
            </style>
        </head>
        <body>
    `;

    for (let page = 0; page < numberOfPages; page++) {
        printContent += `<div class="a4-size">`;
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const itemsForPage = selectedItems.slice(start, end);

        itemsForPage.forEach(item => {
            printContent += `
                <div class="grid-item" style="background-color: ${item.cor};">
                    <img class="logo" src="images/logo.png">
                    <div class="tombo-info">TOMBO:${item.tombo} ${item.ip ? ` IP:${item.ip}` : ''} COD:${item.codItems}</div>
                    <div class="local-info">Local: ${item.location}</div>
                    <div class="quadrado"></div>
                    <div class="qr-code" id="qrcode-${item.id}"></div>
                </div>`;
        });

        printContent += `</div>`;
    }

    printContent += `
        <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
        <script>
            ${selectedItems.map(item => `
                new QRCode(document.getElementById('qrcode-${item.id}'), {
                    text: 'http://10.48.119.115:3000/itemInfo.html?id=${item.id}',
                    width: 62,
                    height: 62
                });
            `).join('')}
        </script>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = function () {
        printWindow.print();
    };
}


    

    function loadLocations(selectedLocation) {
        fetch('/localizacao')
            .then(response => response.json())
            .then(data => {
                const locationSelect = document.getElementById('editLocation');
                locationSelect.innerHTML = ''; // Limpa as opções existentes
    
                data.localizacoes.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.nome; // Use o nome como valor
                    option.text = location.nome;
                    if (location.nome === selectedLocation) {
                        option.selected = true;
                    }
                    locationSelect.appendChild(option);
                });
    
                console.log("Localizações carregadas:", data.localizacoes);
                console.log("Localização selecionada:", selectedLocation);
            })
            .catch(error => {
                console.error('Erro ao carregar localizações:', error);
            });
    }
    

// Exemplo de função para abrir o modal de edição
function showEditItemModal(item) {
    // Converta a data para o formato ISO (AAAA-MM-DD)
    const isoDate = new Date(item.entryDate).toISOString().split('T')[0];

    const modal = createElement('div', { className: 'modal is-active' },
        createElement('div', { className: 'modal-background' }),
        createElement('div', { className: 'modal-card edit-item-card' },
            createElement('header', { className: 'modal-card-head' },
                createElement('p', { className: 'modal-card-title' }, 'Editar Item'),
                createElement('button', { className: 'delete', 'aria-label': 'close' })
            ),
            createElement('section', { className: 'modal-card-body' },
                createElement('label', { for: 'editTombo' }, 'Tombo'),
                createElement('input', { className: 'input', type: 'text', value: item.tombo, id: 'editTombo' }),
                createElement('label', { for: 'editIp' }, 'IP'),
                createElement('input', { className: 'input', type: 'text', value: item.ip, id: 'editIp' }),
                createElement('label', { for: 'editItemName' }, 'Nome do item'),
                createElement('input', { className: 'input', type: 'text', value: item.itemName, id: 'editItemName' }),
                createElement('label', { for: 'editDate' }, 'Data'),
                createElement('input', { className: 'input is-fullwidth', type: 'date', value: isoDate, id: 'editDate' }),
                createElement('label', { for: 'editLocation' }, 'Localização'),
                createElement('div', { className: 'select is-fullwidth' },
                    createElement('select', { id: 'editLocation' },
                        createElement('option', { value: '', disabled: true, selected: true }, 'Selecione uma localização')
                    ),
                ),
                createElement('label', { for: 'editDescription' }, 'Descrição'),
                createElement('textarea', { className: 'textarea', id: 'editDescription' }, item.description)
            ),
            createElement('footer', { className: 'modal-card-foot' },
                createElement('button', { id: 'cancelEditButton', className: 'button is-danger' }, 'Cancelar'),
                createElement('button', { id: 'confirmEditButton', className: 'button is-success' }, 'Salvar')
            )
        )

        
    );

    document.body.appendChild(modal);

    // Adicionar evento para carregar localizações
    loadLocations(item.location);

    const confirmEditButton = document.getElementById('confirmEditButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const closeButton = modal.querySelector('.delete');

    confirmEditButton.addEventListener('click', function () {
        // Chamada para atualizar o item
        const editedItem = {
            tombo: document.getElementById('editTombo').value,
            ip: document.getElementById('editIp').value,
            itemName: document.getElementById('editItemName').value,
            entryDate: document.getElementById('editDate').value,
            description: document.getElementById('editDescription').value,
            location: document.getElementById('editLocation').value,
        };

        // Exibir um modal de confirmação
        showUpdateConfirmationModal(() => {
            // Faça uma requisição ao servidor para atualizar o item com os novos valores
            fetch(`/items/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedItem)
            })
            .then(response => response.json())
            .then(data => {
                // Trate a resposta do servidor
                console.log(data);

                // Feche o modal
                document.body.removeChild(modal);

                // Atualize a tabela com os novos dados (opcional)
                fetchAndDisplayItems();
            })
            .catch(error => {
                // Trate erros, exiba mensagens de erro, etc.
                console.error(error);
            });
            
        });
    });

    cancelEditButton.addEventListener('click', function () {
        // Feche o modal sem salvar as alterações
        document.body.removeChild(modal);
    });

    closeButton.addEventListener('click', function () {
        // Feche o modal sem salvar as alterações
        document.body.removeChild(modal);
    });
}

// Função para abrir o modal de confirmação
function showUpdateConfirmationModal(confirmCallback) {
    const modal = createElement('div', { className: 'modal is-active' },
        createElement('div', { className: 'modal-background' }),
        createElement('div', { className: 'modal-card' },
            createElement('header', { className: 'modal-card-head' },
                createElement('p', { className: 'modal-card-title' }, 'Confirmação'),
                createElement('button', { className: 'delete', 'aria-label': 'close' })
            ),
            createElement('section', { className: 'modal-card-body' },
                createElement('p', {}, 'Deseja realmente atualizar o item?')
            ),
            createElement('footer', { className: 'modal-card-foot' },
                createElement('button', { id: 'confirmUpdateButton', className: 'button is-success' }, 'Confirmar'),
                createElement('button', { id: 'cancelUpdateButton', className: 'button is-danger' }, 'Cancelar')
            )
        )
    );

    document.body.appendChild(modal);

    const confirmUpdateButton = document.getElementById('confirmUpdateButton');
    const cancelUpdateButton = document.getElementById('cancelUpdateButton');
    const closeButton = modal.querySelector('.delete');

    confirmUpdateButton.addEventListener('click', function () {
        // Chame a função de confirmação passada como argumento
        confirmCallback();
        // Feche o modal de confirmação
        document.body.removeChild(modal);
    });

    cancelUpdateButton.addEventListener('click', function () {
        // Feche o modal de confirmação
        document.body.removeChild(modal);
    });

    closeButton.addEventListener('click', function () {
        // Feche o modal de confirmação
        document.body.removeChild(modal);
    });
    
}



   function showQRCodeModal(item) {
    const modal = createElement('div', { className: 'modal is-active' },
        createElement('div', { className: 'modal-background', style: 'background-color: rgba(0, 0, 0, 0.75);' }),
        createElement('div', { className: 'modal-card label-card', style: 'width: 480px; height: 305px; position: relative;' },
            createElement('header', { className: 'modal-card-head' },
                createElement('p', { className: 'modal-card-title' }),
                createElement('button', { className: 'delete', 'aria-label': 'close' })
            ),

            createElement('section', { className: 'modal-card-body' },
                createElement('div', {
                    className: 'label-content',
                    style: `-webkit-print-color-adjust: exact; border-radius: 10px; border: 1px solid black; width: 185px; height: 85px; position: absolute; margin-right: 10px; background-color: ${item.cor};`
                },
                    createElement('img', { src: 'images/logo.png', alt: 'Logo', className: 'logo', style: 'width: 120px; height: 65px; position: absolute; top: 15px; left: -5px;' }),
                    createElement('div', { className: 'item-details' },
                        createElement('div', { className: 'tombo-info', style: 'font-weight: bold; font-size: 7px; position: absolute; white-space: nowrap; top: 1px; left: 5px;' },
                            createElement('div', { className: 'info-value' },  'TOMBO:', item.tombo, item.ip ? ` IP:${item.ip}` : '', ' COD:', item.codItems)
                        ),

                        createElement('div', { className: 'local-info', style: 'font-weight: bold; font-size: 7px; position: absolute; white-space: nowrap; top: 67px; left: 5px;' },
                            createElement('div', { className: 'info-value' }, 'Local: ', item.location)
                        ),

                        createElement('div', { className: 'quadrado', style: 'width: 68px; height: 66px; border: 1px solid; border-radius: 4px; border-color: #000; position: absolute; top: 12px; right: 7px;' }),
                    ),
                    createElement('div', { className: 'qr-code ', style: 'position: absolute; top: 14px; right: 10px;' },
                        createElement('div', { id: 'qrcode', style: 'width: 62px; height: 62px;' })
                    )
                )
            ),
            createElement('footer', { className: 'modal-card-foot' },
                createElement('button', { id: 'imprimirButton', className: 'button is-primary is-small' }, 'Imprimir'),
                createElement('a', { id: 'downloadButton', className: 'button is-info is-small', href: '#', download: 'etiqueta.png' }, 'Download')
            )
        )
    );

    document.body.appendChild(modal);

    const itemUrl = `http://10.48.119.115:3000/itemInfo.html?id=${item.id}`;
    new QRCode(document.getElementById('qrcode'), {
        text: itemUrl,
        width: 62,
        height: 62
    });


        const imprimirButton = document.getElementById('imprimirButton');
        const downloadButton = document.getElementById('downloadButton');
        const closeButton = modal.querySelector('.delete');
    
        // Evento de clique no botão "Imprimir"
        imprimirButton.addEventListener('click', function () {
            // Oculte os botões de ação e o botão de fechar antes de imprimir
            downloadButton.style.display = 'none';
            imprimirButton.style.display = 'none';
            closeButton.style.display = 'none';
    
            // Chame a função de impressão do navegador
            window.print();
    
            // Restaure a visibilidade dos botões após a impressão
            downloadButton.style.display = 'block';
            imprimirButton.style.display = 'block';
            closeButton.style.display = 'block';
        });
    
        // Evento de clique no botão "Download"
        downloadButton.addEventListener('click', () => {
            // Use a URL do seu PDF gerado
            const pdfUrl = document.getElementById('qrcode').toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = 'etiqueta.png';
            a.click();
        });
    
        // Evento de clique no ícone de fechamento
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }    
    
    function createElement(tag, options = {}, ...children) {
        const element = document.createElement(tag);
        Object.assign(element, options);
        element.append(...children);
        return element;
    }
});
