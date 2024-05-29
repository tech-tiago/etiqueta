document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('localizacaoForm');
    const notificationArea = document.getElementById('notification-area');
    const corInput = document.getElementById('corInput');
    const corSelector = document.getElementById('corSelector');
    const corPreview = document.getElementById('corPreview');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {
            nome: formData.get('nome'),
            cor: formData.get('cor') 
        };

        try {
            const response = await fetch('/localizacao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('success', `Localização adicionada com sucesso!`);
                form.reset();
            } else {
                const error = await response.json();
                showNotification('error', `Erro ao adicionar localização: ${error.message}`);
            }
        } catch (error) {
            showNotification('error', `Erro ao conectar com o servidor: ${error.message}`);
        }
    });

    // Atualiza o valor do input oculto e a cor da etiqueta de exemplo quando o usuário seleciona uma cor
    corSelector.addEventListener('input', () => {
        corInput.value = corSelector.value;
        corPreview.style.backgroundColor = corSelector.value;
    });

    function showNotification(type, message) {
        notificationArea.innerHTML = `
            <div class="notification is-${type}">
                <button class="delete"></button>
                ${message}
            </div>
        `;
        document.querySelector('.notification .delete').addEventListener('click', () => {
            notificationArea.innerHTML = '';
        });
    }
});
