document.addEventListener("DOMContentLoaded", function() {

    const searchInput = document.getElementById("searchInput");
    
    let navbarBurger = document.querySelector('.navbar-burger');
    
    if (navbarBurger) {
        navbarBurger.addEventListener('click', function() {
            this.classList.toggle('is-active');
            document.getElementById(this.dataset.target).classList.toggle('is-active');
        });
    } else {
        console.error("Elemento .navbar-burger não encontrado");
    }

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const searchValue = this.value;
            fetchAndDisplayItems(searchValue);
        });
    }

    const addItemForm = document.getElementById("itemForm");
    if (addItemForm) {
        addItemForm.addEventListener("submit", function(event) {
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

    function fetchAndDisplayItems(search = "") {
        let apiUrl = `/items`;
        if (search) {
            apiUrl += `?search=${search}`;
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

    function createElement(tag, options = {}, ...children) {
        const element = document.createElement(tag);
        Object.assign(element, options);
        element.append(...children);
        return element;
    }
    


    function displayItemsInTable(items) {
        const tableId = '#historyTable';
    
        // Verifique se a tabela já foi inicializada como DataTable
        if ($.fn.DataTable.isDataTable(tableId)) {
            // Destrua a instância existente do DataTable
            $(tableId).DataTable().clear().destroy();
        }
    
        // Limpe o conteúdo da tabela
        $(tableId).empty();
    
        // Inicialize a tabela novamente com os novos dados
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
                        return '<button class="generate-qr-button button is-info"><i class="fa-solid fa-qrcode"></i>&nbsp;Gerar</button>';
                    }
                },
                { 
                    data: null,
                    title: 'Acão',
                    render: function (data, type, row) {
                        return '<button class="edit-item-button button is-small is-warning"><i class="fa-solid fa-pencil"></i>&nbsp;Editar</button>';
                    }
                }
            ]
        });
    
        // Adicione um evento de clique aos botões de geração de QR code
        $('#historyTable tbody').on('click', '.generate-qr-button', function () {
            const data = table.row($(this).parents('tr')).data();
            showQRCodeModal(data);
        });
    
        // Exemplo de evento de clique para abrir o modal de edição
        $('#historyTable tbody').on('click', '.edit-item-button', function () {
            const data = table.row($(this).parents('tr')).data();
            showEditItemModal(data);
        });
    }
    
    
    

    function formatDateToPTBR(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
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

   // Exiba um alerta de sucesso
   // showSuccessNotification('Item atualizado com sucesso.');


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
                        createElement('div', { className: 'tombo-info', style: 'font-size: 8px; position: absolute; white-space: nowrap; top: 1px; left: 5px;' },
                            createElement('div', { className: 'info-value' }, 'TOMBO:', item.tombo, item.ip ? ` IP:${item.ip}` : '', ' COD:', item.codItems)
                        ),

                        createElement('div', { className: 'local-info', style: 'font-size: 8px; position: absolute; white-space: nowrap; top: 67px; left: 5px;' },
                            createElement('div', { className: 'info-value' }, 'Local: ', item.location)
                        ),

                        createElement('div', { className: 'quadrado', style: 'width: 68px; height: 66px; border: 1px solid; border-radius: 4px; border-color: #000; position: absolute; top: 12px; right: 7px;' }),
                    ),
                    createElement('div', { className: 'qr-code ', style: 'position: absolute; top: 15px; right: 11px;' },
                        createElement('div', { id: 'qrcode', style: 'width: 60px; height: 60px;' })
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
        width: 60,
        height: 60
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
