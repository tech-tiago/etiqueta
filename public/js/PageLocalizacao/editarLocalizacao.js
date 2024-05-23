document.addEventListener("DOMContentLoaded", function () {
    let navbarBurger = document.querySelector('.navbar-burger');

    if (navbarBurger) {
        navbarBurger.addEventListener('click', function () {
            this.classList.toggle('is-active');
            document.getElementById(this.dataset.target).classList.toggle('is-active');
        });
    } else {
        console.error("Elemento .navbar-burger não encontrado");
    }

    // Função para buscar e exibir localizações
    fetchAndDisplayLocations();

    function fetchAndDisplayLocations() {
        fetch('/localizacao')
            .then(response => response.json())
            .then(data => {
                if (data.localizacoes && Array.isArray(data.localizacoes)) {
                    const formattedLocations = data.localizacoes.map(location => ({
                        id: location.id,
                        nome: location.nome,
                        cor: `<span style="background-color: ${location.cor}; color: ${location.cor};">██</span>`,
                        corCodigo: location.cor
                    }));
                    displayLocationsInTable(formattedLocations);
                } else {
                    console.error("Formato de dados inesperado:", data);
                }
            })
            .catch(error => {
                console.error("Erro ao buscar localizações:", error);
            });
    }

    // Função para excluir localizações
    function deleteLocation(id) {
        console.log(`Tentando excluir localização com ID: ${id}`); // Log para verificar o ID

        fetch(`/localizacao/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir localização');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Localização ${id} excluída com sucesso`);
            fetchAndDisplayLocations(); // Atualiza a tabela após a exclusão
        })
        .catch(error => {
            console.error('Erro ao excluir localização:', error);
        });
    }

    function displayLocationsInTable(locations) {
        const tableId = '#localizacaoTable';

        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }

        $(tableId).DataTable({
            paging: true,
            searching: true,
            pageLength: 10,
            "bLengthChange": false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
            },
            data: locations,
            columns: [
                { data: 'nome', title: 'Nome' },
                { data: 'cor', title: 'Cor' },
                {
                    data: null,
                    title: 'Editar',
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="buttons is-grouped">
                                <button class="edit-location-button button is-small is-warning" data-id="${row.id}"><i class="fa-solid fa-pencil"></i>&nbsp;Editar</button>
                                <button class="delete-location-button button is-small is-danger" data-id="${row.id}"><i class="fa-solid fa-trash"></i>&nbsp;Excluir</button>
                            </div>`;
                    }
                }
            ],
        });

        // Remove event listener para evitar múltiplas adições
        $('#localizacaoTable tbody').off('click', '.edit-location-button');

        $('#localizacaoTable tbody').on('click', '.edit-location-button', function () {
            const data = $(this).data();
            showEditLocationModal(data.id);
        });

        $('#localizacaoTable tbody').off('click', '.delete-location-button');

        $('#localizacaoTable tbody').on('click', '.delete-location-button', function () {
            const id = $(this).data('id');
            showDeleteConfirmationModal(id);
        });
    }

    function showDeleteConfirmationModal(id) {
        fetch(`/localizacao/${id}`)
            .then(response => response.json())
            .then(location => {
                removeExistingModal();
    
                const modal = createDeleteConfirmationModal(location);
                document.body.appendChild(modal);
    
                const confirmDeleteButton = document.getElementById('confirmDeleteButton');
                const cancelDeleteButton = document.getElementById('cancelDeleteButton');
                const closeButton = modal.querySelector('.delete');
                const modalBackground = modal.querySelector('.modal-background');
    
                const handleModalClose = () => closeModal(modal);
    
                cancelDeleteButton.addEventListener('click', handleModalClose);
                closeButton.addEventListener('click', handleModalClose);
                modalBackground.addEventListener('click', handleModalClose);
    
                confirmDeleteButton.addEventListener('click', function () {
                    deleteLocation(location.id);
                    handleModalClose();
                });
    
                modal.addEventListener('click', function (event) {
                    if (event.target === modal) {
                        handleModalClose();
                    }
                });
            })
            .catch(error => {
                console.error("Erro ao buscar localização:", error);
            });
    }
    
    function createDeleteConfirmationModal(location) {
        const modal = document.createElement('div');
        modal.className = 'modal is-active';
        modal.innerHTML = `
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Confirmar Exclusão</p>
                   <p hidden> <button class="delete" aria-label="close"></button></p>
                </header>
                <section class="modal-card-body">
                    <p>Tem certeza de que deseja excluir a localização abaixo?</p>
                    <ul>
                        <li><strong>Nome:</strong> ${location.nome}</li>
                        <li><strong>Cor:</strong> <span style="background-color: ${location.cor}; color: ${location.cor};">██</span></li>
                    </ul>
                </section>
                <footer class="modal-card-foot">
                    <button id="cancelDeleteButton" class="button is-danger">Cancelar</button>
                    <button id="confirmDeleteButton" class="button is-success">Confirmar</button>
                </footer>
            </div>
        `;
        return modal;
    }

    function showEditLocationModal(id) {
        fetch(`/localizacao/${id}`)
            .then(response => response.json())
            .then(location => {
                removeExistingModal();

                const modal = createEditLocationModal(location);
                document.body.appendChild(modal);

                const confirmEditButton = document.getElementById('confirmEditButton');
                const cancelEditButton = document.getElementById('cancelEditButton');
                const closeButton = modal.querySelector('.delete');
                const modalBackground = modal.querySelector('.modal-background');

                const handleModalClose = () => closeModal(modal);

                // Remover event listeners anteriores para evitar duplicação
                confirmEditButton.removeEventListener('click', handleConfirmEdit);
                cancelEditButton.removeEventListener('click', handleModalClose);
                closeButton.removeEventListener('click', handleModalClose);
                modalBackground.removeEventListener('click', handleModalClose);

                cancelEditButton.addEventListener('click', handleModalClose);
                closeButton.addEventListener('click', handleModalClose);
                modalBackground.addEventListener('click', handleModalClose);

                function handleConfirmEdit() {
                    const editedLocation = {
                        nome: document.getElementById('editNome').value,
                        cor: document.getElementById('editCor').value
                    };

                    fetch(`/localizacao/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(editedLocation)
                    })
                    .then(response => response.json())
                    .then(data => {
                        handleModalClose(); // Fechar o modal ao finalizar a edição
                        fetchAndDisplayLocations(); // Atualiza a tabela após a edição
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }

                confirmEditButton.addEventListener('click', handleConfirmEdit);

                modal.addEventListener('click', function (event) {
                    if (event.target === modal) {
                        handleModalClose();
                    }
                });
            })
            .catch(error => {
                console.error("Erro ao buscar localização:", error);
            });
    }
    
    function createEditLocationModal(location) {
        const modal = document.createElement('div');
        modal.className = 'modal is-active';
        modal.innerHTML = `
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Editar Localização</p>
                    <p hidden><button class="delete" aria-label="close"></button> </p>
                </header>
                <section class="modal-card-body">
                    <label for="editNome">Nome</label>
                    <input class="input" type="text" id="editNome" value="${location.nome}">
                    <label for="editCor">Cor</label>
                    <input class="input" type="color" id="editCor" value="${location.cor}">
                </section>
                <footer class="modal-card-foot">
                    <button id="cancelEditButton" class="button is-danger">Cancelar</button>
                    <button id="confirmEditButton" class="button is-success">Salvar</button>
                </footer>
            </div>
        `;
        return modal;
    }

    function removeExistingModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
    

    function closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
});
