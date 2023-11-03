function createElement(elementName, attributes, ...children) {
    const element = document.createElement(elementName);

    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    }

    return element;
}

document.addEventListener("DOMContentLoaded", function () {
    const gerarTodasAsEtiquetasButton = document.getElementById('gerarTodasAsEtiquetasButton');

    gerarTodasAsEtiquetasButton.addEventListener('click', function () {
        fetch('/items')
            .then(response => response.json())
            .then(data => {
                if (data.items && Array.isArray(data.items)) {
                    createPrintPage(data.items);
                } else {
                    console.error('Resposta inesperada do servidor:', data);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar itens:', error);
            });
    });

    function createPrintPage(items) {
        items.forEach(item => {
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
        });
    }
});
