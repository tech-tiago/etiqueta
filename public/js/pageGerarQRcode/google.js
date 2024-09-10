function gerarProtocolo() {
    var aba = SpreadsheetApp.getActiveSheet();
    var lastRow = aba.getLastRow();
    
    // Se lastRow for menor que 2, não há dados suficientes na planilha
    if (lastRow < 2) {
        lastRow = 2;
    }
    
    // A partir da célula H2 (linha 2, coluna 8)
    var numRows = lastRow - 1;
    if (numRows < 1) {
        numRows = 1;
    }
    
    var protocoloBase = aba.getRange(2, 8, numRows).getValues();
    
    // Encontra a última linha preenchida na coluna H
    var lin = protocoloBase.filter(function(row) {
        return row[0] !== "";
    }).length;
    
    // Gera o número do protocolo
    var protocolo = "CPS" + ("000000" + (lin + 1)).slice(-6);
    
    // Define o destino na célula apropriada (começando em H2 e seguindo nas próximas linhas)
    var destino = aba.getRange(2 + lin, 8);
    
    // Verifica o nome da aba antes de definir o valor do protocolo
    if (aba.getName() == "Respostas ao formulário 1") {
        destino.setValue(protocolo);
    }
}
