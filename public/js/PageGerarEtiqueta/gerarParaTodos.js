document.addEventListener('DOMContentLoaded', function () {
  // Adicionar evento para o botão de imprimir todos
  const printAllButton = document.getElementById('printAllButton');
  if (printAllButton) {
    printAllButton.addEventListener('click', function () {
      fetch('/items')
        .then((response) => response.json())
        .then((data) => {
          if (data.items && Array.isArray(data.items)) {
            openPrintPage(data.items);
          } else {
            console.error('Resposta inesperada do servidor:', data);
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar itens:', error);
        });
    });
  }

  function openPrintPage(items) {
    const printWindow = window.open('', '_blank');
    const itemsPerPage = 48; // Quantidade de etiquetas por página
    const numberOfPages = Math.ceil(items.length / itemsPerPage);
    let printContent = `
            <html>
            <head>
                <title>Imprimir Etiquetas</title>
                <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css'> 
                <style>
                    /* Estilos para a impressão em folha A4 */
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
                        background-color: #DCDCDC;
                        margin: 3px;
                        position: relative;
                    }
                    .tombo-info, .local-info, .qr-code, .ip-info, .data-info, .cod-info {
                        font-size: 8px;
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
                        top: 12px;
                        right: 7px;
                    }
                    .qr-code {
                        top: 15px;
                        right: 11px;
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
      const itemsForPage = items.slice(start, end);

      itemsForPage.forEach(item => {
        printContent += `
          <div class="grid-item">
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
                    ${items.map(item => `
                        new QRCode(document.getElementById('qrcode-${item.id}'), {
                            text: 'http://10.48.119.115:3000/itemInfo.html?id=${item.id}',
                            width: 60,
                            height: 60
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
});
