document.addEventListener("DOMContentLoaded", () => {
  const addItemForm = document.getElementById("itemForm");
  if (addItemForm) {
    addItemForm.addEventListener("submit", function (event) {
      event.preventDefault();
      showConfirmationModal();
    });
  }
});

/**
 * Mostra uma janela modal para confirmar a adição de um item.
 */
function showConfirmationModal() {
  const modal = document.createElement("div");
  modal.className = "modal is-active";
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Confirmação</p>
            <button class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
            Deseja realmente cadastrar o item?
        </section>
        <footer class="modal-card-foot">
            <button class="button is-success" id="confirm-add">Confirmar</button>
            <button class="button" id="cancel-add">Cancelar</button>
        </footer>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".delete").addEventListener("click", () => closeModal(modal));
  modal.querySelector("#cancel-add").addEventListener("click", () => closeModal(modal));
  modal.querySelector("#confirm-add").addEventListener("click", () => {
    actualAddItem();
    closeModal(modal);
  });
}

/**
 * Fecha a janela modal.
 * @param {HTMLElement} modal - O elemento da janela modal a ser fechado.
 */
function closeModal(modal) {
  document.body.removeChild(modal);
}

/**
 * Adiciona um novo item fazendo uma requisição POST ao servidor.
 */
function actualAddItem() {
  const form = document.forms['itemForm'];
  
  // Corrigindo a formatação da data de entrada
  const entryDateElement = form.elements['entryDate'];
  let formattedDate = null;
  if (entryDateElement.value) {
    const [dia, mes, ano] = entryDateElement.value.split('/');
    formattedDate = `${ano}-${mes}-${dia}`;
  }

  const formData = {
    itemName: form.elements['itemName'].value,
    entryDate: formattedDate,
    location: form.elements['location'].value,
    description: form.elements['description'].value,
    ip: form.elements['ip'].value,
    tombo: form.elements['tombo'].value
  };


  fetch('/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      const message = data.message || data.error;
      displayNotification(message, 'success');

      // Limpando o formulário se o cadastro for bem-sucedido
      if (data.message) {
        form.reset();
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      displayNotification('Ocorreu um erro ao adicionar o item.', 'error');
    });
}

/**
 * Mostra uma notificação com uma mensagem e tipo específicos.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de notificação (info, success, error).
 */
function displayNotification(message, type = 'info') {
  const notificationArea = document.getElementById("notification-area");
  const notification = document.createElement('div');
  notification.className = `notification ${type === 'error' ? 'is-danger' : type === 'success' ? 'is-success' : 'is-info'}`;
  notification.innerHTML = `
    <button class="delete"></button>
    ${message}
  `;
  notificationArea.appendChild(notification);

  notification.querySelector(".delete").addEventListener("click", () => {
    notificationArea.removeChild(notification);
  });

  setTimeout(() => {
    if (notificationArea.contains(notification)) {
      notificationArea.removeChild(notification);
    }
  }, 5000);
}

function addItem() {
  showConfirmationModal();
}
