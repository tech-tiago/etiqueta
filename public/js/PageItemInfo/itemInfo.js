document.addEventListener("DOMContentLoaded", function() {
// Manipulando o envio do formulário de cadastro
const addItemForm = document.getElementById("itemForm");
if (addItemForm) {
addItemForm.addEventListener("submit", function(event) {
    event.preventDefault();
    addItem();
});
}

// Carrega informações do item se estiver na página de detalhes
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
if (id) {
  fetchItemInfo(id);
}
});

function fetchItemInfo(id) {
  fetch(`/items/${id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro de resposta do servidor: " + response.statusText);
        }
        return response.json();
    })
    .then(item => {
        // Verifica se o valor do 'ip' é null ou vazio e aplica a classe 'hide-if-null' se for null ou vazio
        if (item.ip === null || item.ip === '') {
          const ipElement = document.querySelector("#ip");
          if (ipElement) {
            ipElement.classList.add("hide-if-null");
          }
        }

        // Cria o contêiner
        const container = createItemContainer();

        // Formatação da data PT-BR
        item.entryDate = formatDateToPTBR(item.entryDate);

        // Preenche o contêiner com os dados do item
        container.querySelector("#itemCodItems").textContent = item.codItems;
        container.querySelector("#ip").textContent = item.ip;
        container.querySelector("#itemName").textContent = item.itemName;
        container.querySelector("#itemEntryDate").textContent = item.entryDate;
        container.querySelector("#itemLocation").textContent = item.location;
        container.querySelector("#itemDescription").textContent = item.description;
    })
    .catch(error => {
        console.error("Erro ao buscar informações do item:", error);
    });
}


function createItemContainer() {
// Cria os principais elementos
const section = document.createElement('section');
section.className = "section";

const container = document.createElement('div');
container.className = "container";

const title = document.createElement('h1');
title.className = "title";
title.textContent = "Detalhes do Item";

const box = document.createElement('div');
box.className = "box";

const details = [
  { label: "Código do Item", id: "itemCodItems" },
  { label: "IP", id: "ip" },
  { label: "Nome", id: "itemName" },
  { label: "Data de Entrada", id: "itemEntryDate" },
  { label: "Localização", id: "itemLocation" },
  { label: "Descrição", id: "itemDescription" }
];

for (const detail of details) {
  const para = document.createElement('p');
  para.innerHTML = `<strong>${detail.label}:</strong> <span id="${detail.id}"></span>`;
  box.appendChild(para);
}

// Anexa todos os elementos
container.appendChild(title);
container.appendChild(box);
section.appendChild(container);

// Adiciona o contêiner criado ao corpo do documento
document.getElementById('dynamicContent').appendChild(section);

return container;
}
function formatDateToPTBR(dateString) {
const date = new Date(dateString);
const day = String(date.getUTCDate()).padStart(2, '0');
const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Os meses vão de 0 a 11, então adicionamos +1 para corrigir.
const year = date.getUTCFullYear();

return `${day}/${month}/${year}`;
}

