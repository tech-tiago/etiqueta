document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('localizacaoForm');
    const notificationArea = document.getElementById('notification-area');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {
            nome: formData.get('nome')
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
