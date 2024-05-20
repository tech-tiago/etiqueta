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
        const table = $('#historyTable').DataTable({
            paging: true,
            searching: true,
            pageLength: 10,
            "bLengthChange": false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
            },
            data: items,
            columns: [
                { data: 'codItems' },
                { data: 'tombo' },
                { data: 'itemName' },
                { 
                    data: 'entryDate',
                    render: function (data, type, row) {
                        return formatDateToPTBR(data);
                    }
                },
                { data: 'location' },
                { data: 'description' },
                { 
                    data: null,
                    render: function (data, type, row) {
                        return '<button class="generate-qr-button button is-info"><i class="fa-solid fa-qrcode"></i>&nbsp;Gerar</button>';
                    }
                },
                { 
                    data: null,
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

 

// Exemplo de função para abrir o modal de edição
function showEditItemModal(item) {

    let ipDoItem;

    if (item.ip === 'null') {
        ipDoItem = '';
    } else {
        ipDoItem = `_IP: ${item.ip}`;
    }

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
                createElement('input', { className: 'input', type: 'date', value: isoDate, id: 'editDate' }),
                createElement('label', { for: 'editLocation' }, 'Localização'),
                createElement('input', { className: 'input', type: 'text', value: item.location, id: 'editLocation' }),
                createElement('label', { for: 'editDescription' }, 'Descrição'),
                createElement('input', { className: 'input', type: 'textarea', value: item.description, id: 'editDescription' }),
            ),
            createElement('footer', { className: 'modal-card-foot' },
                createElement('button', { id: 'cancelEditButton', className: 'button is-danger' }, 'Cancelar'),
                createElement('button', { id: 'confirmEditButton', className: 'button is-success' }, 'Salvar')
            )
        )
    );

    document.body.appendChild(modal);

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
function showSuccessNotification(message) {
    const notification = createElement('div', { className: 'notification is-success' }, message);
    document.body.appendChild(notification);

    // Remova o alerta após alguns segundos (opcional)
    setTimeout(function () {
        document.body.removeChild(notification);
    }, 3000); // 3 segundos

    
}


    function showQRCodeModal(item) {

        const modal = createElement('div', { className: 'modal is-active' },
            createElement('div', { className: 'modal-background' }),
            createElement('div', { className: 'modal-card label-card' },
                createElement('header', { className: 'modal-card-head' },
                    createElement('p', { className: 'modal-card-title' }),
                    createElement('button', { className: 'delete', 'aria-label': 'close' })
                ),

                createElement('section', { className: 'modal-card-body' },
                    createElement('div', { className: 'label-content' },
                        createElement('img', { src: 'images/logo.png', alt: 'Logo', className: 'logo' }),
                        createElement('div', { className: 'item-details' },
                            createElement('div', { className: 'tombo-info' },
                            createElement('div', { className: 'info-value' }, 'TOMBO:', item.tombo, item.ip ? ` IP:${item.ip}` : '' ,' COD:',item.codItems)
                            ),

                            createElement('div', { className: 'local-info' },
                                createElement('div', { className: 'info-value' }, 'Local: ', item.location)
                            ),

                            createElement('div', { className: 'quadrado' },
                            )
                        ),
                        createElement('div', { className: 'qr-code ' },
                            createElement('div', { id: 'qrcode' })
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
