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
                }
            ]
        });
    
        // Adicione um evento de clique aos botões de geração de QR code
        $('#historyTable tbody').on('click', '.generate-qr-button', function () {
            const data = table.row($(this).parents('tr')).data();
            showQRCodeModal(data);
        });
    }
    




    function formatDateToPTBR(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
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
                                createElement('div', { className: 'info-value' }, 'TOMBO:', item.tombo,'_IP:', item.ip ,'_COD:',item.codItems)
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
