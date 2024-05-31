const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuração para gerenciamento de sessão
app.use(session({
  secret: 'xR5A%Yz!9vWQs2T#eFD',
  resave: false,
  saveUninitialized: false,
}));

// Configuração de token CSRF
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Middleware para verificar sessão
const checkSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send('Acesso não autorizado');
  }
  next();
};

// Criando conexão com o banco
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // seu usuário
  password: '', // sua senha
  database: 'etiqueta', // seu banco de dados
  timezone: '-03:00',  // Use UTC-3, por exemplo, para "America/Sao_Paulo"
  charset: 'utf8mb4', // Suporte a todos os caracteres UTF e emojis.
  connectTimeout: 10000, // Tempo em milissegundos antes de uma tentativa de conexão ser considerada falha
});

connection.connect((error) => {
  if (error) throw error;
  console.log('Conectado ao banco de dados MySQL.');
});

// Rota para obter o token CSRF
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Rota para a página raiz
app.get('/', (req, res) => {
  if (!req.session.user) {
    res.sendFile(path.join(__dirname, 'login.html'));
  } else {
    res.redirect('/index.html');
  }
});

// Rota para o processo de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica no banco de dados se as credenciais estão corretas
  const query = 'SELECT * FROM user WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (error, results) => {
    if (error) {
      console.error('Erro durante a consulta:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    if (results.length > 0) {
      // Usuário autenticado com sucesso
      const user = results[0];
      // Armazena o usuário na sessão
      req.session.user = user;

      // Redireciona para a página index após o login bem-sucedido
      res.redirect('/index.html');
    } else {
      // Redireciona de volta para a página de login se as credenciais estiverem incorretas
      res.status(401).send('Credenciais inválidas');
    }
  });
});

// Rota protegida index.html
app.get('/index.html', checkSession, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.redirect('/');
  });
});



// Endpoint para adicionar um novo item
app.post('/items', (req, res) => {
  console.log('Corpo da requisição:', req.body);
  const { itemName, entryDate, location, description, ip, tombo } = req.body;

  if (!itemName || !entryDate || !location || !description || !tombo) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  // Utilize entryDate diretamente como formattedDate
  const formattedDate = entryDate;

  // Busca o ID da localização com base no nome
  const selectQuery = 'SELECT id FROM localizacao WHERE nome = ?';

  connection.query(selectQuery, [location], (error, results) => {
    if (error) {
      console.error('Erro ao buscar localização:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: `Localização '${location}' não encontrada` });
    }

    const localizacaoId = results[0].id;

    // Inserção do item na tabela items
    const tempCodItems = 'TEMP';
    const insertQuery = 'INSERT INTO items (itemName, entryDate, localizacao_id, description, codItems, ip, tombo) VALUES (?, ?, ?, ?, ?, ?, ?)';

    connection.query(insertQuery, [itemName, formattedDate, localizacaoId, description, tempCodItems, ip, tombo], (error, results) => {
      if (error) {
        console.error('Erro durante a inserção:', error);
        return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
      }

      const itemId = results.insertId; // Capturando o ID inserido
      
      let codItems;
      if (itemId >= 10) {
        codItems = 'CPS0000' + itemId;
      } else if (itemId >= 100) {
        codItems = 'CPS000' + itemId;
      } else if (itemId >= 1000) {
        codItems = 'CPS00' + itemId;
      } else {
        codItems = 'CCD000' + itemId;
      }

      // Atualiza o código do item com base no ID gerado
      const updateQuery = 'UPDATE items SET codItems = ? WHERE id = ?';
      connection.query(updateQuery, [codItems, itemId], (error) => {
        if (error) return res.status(500).send(error);
        console.log('Valores a serem inseridos:', { itemName, entryDate: formattedDate, location, description, tempCodItems, ip, tombo });
        res.json({
          id: itemId,
          message: 'Item adicionado com sucesso!',
          codItems
        });
      });
    });
  });
});

// Exemplo de rota para exclusão de item
app.delete('/items/:id', (req, res) => {
  const itemId = req.params.id;

  // Aqui você implementa a lógica para excluir o item do banco de dados
  const deleteQuery = 'DELETE FROM items WHERE id = ?';

  connection.query(deleteQuery, [itemId], (error, results) => {
      if (error) {
          console.error('Erro durante a exclusão:', error);
          return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
      }

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: `Item ${itemId} não encontrado` });
      }

      res.json({ message: `Item ${itemId} excluído com sucesso` });
  });
});



// Endpoint para obter um item específico pelo ID
app.get('/items/:id', (req, res) => {
  const id = req.params.id;
  console.log("ID requisitado:", id);

  const query = 'SELECT * FROM items WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Erro durante a consulta:", error);
      return res.status(500).send(error);
    }
    console.log("Resultado da consulta:", results);

    if (results.length === 0) return res.status(404).send({ message: "Item não encontrado" });
    res.json(results[0]);
  });
});



// Endpoint para atualizar os detalhes de um item pelo ID
app.put('/items/:id', (req, res) => {
  const id = req.params.id;
  const { itemName, entryDate, location, description, ip, tombo } = req.body;

  // Validate that required fields are provided
  if (!itemName || !entryDate || !location || !description || !tombo) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }


  const formattedDate = entryDate;

  const selectLocationQuery = 'SELECT id FROM localizacao WHERE nome = ?';

  connection.query(selectLocationQuery, [location], (error, results) => {
    if (error) {
      console.error('Erro ao buscar localização:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: `Localização '${location}' não encontrada` });
    }

    const localizacaoId = results[0].id;

    // Step 2: Update the item in the database
    const updateQuery = 'UPDATE items SET itemName = ?, entryDate = ?, localizacao_id = ?, description = ?, ip = ?, tombo = ? WHERE id = ?';

    connection.query(updateQuery, [itemName, formattedDate, localizacaoId, description, ip, tombo, id], (error, results) => {
      if (error) {
        console.error('Erro durante a atualização:', error);
        return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
      }

      console.log('Valores atualizados:', { itemName, entryDate: formattedDate, location, description, ip, tombo, id });
      res.json({
        id,
        message: 'Item atualizado com sucesso!'
      });
    });
  });
});


// Endpoint para excluir uma localização específica pelo ID
app.delete('/localizacao/:id', (req, res) => {
  const id = req.params.id;

  const deleteQuery = 'DELETE FROM localizacao WHERE id = ?';

  connection.query(deleteQuery, [id], (error, results) => {
      if (error) {
          console.error('Erro durante a exclusão:', error);
          return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
      }

      console.log('Localização excluída com sucesso');
      res.json({ message: 'Localização excluída com sucesso!' });
  });
});


// Endpoint para obter uma localização específica pelo ID
app.get('/localizacao/:id', (req, res) => {
  const id = req.params.id;

  const query = 'SELECT * FROM localizacao WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Erro durante a consulta:", error);
      return res.status(500).send(error);
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Localização não encontrada" });
    }

    res.json(results[0]);
  });
});

// Endpoint para atualizar uma localização pelo ID
app.put('/localizacao/:id', (req, res) => {
  const id = req.params.id;
  const { nome, cor } = req.body;

  if (!nome || !cor) {
    return res.status(400).json({ message: 'Nome e cor da localização são obrigatórios' });
  }

  const updateQuery = 'UPDATE localizacao SET nome = ?, cor = ? WHERE id = ?';

  connection.query(updateQuery, [nome, cor, id], (error, results) => {
    if (error) {
      console.error('Erro durante a atualização:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    console.log('Localização atualizada:', { nome, cor, id });
    res.json({
      id,
      message: 'Localização atualizada com sucesso!'
    });
  });
});


// Endpoint para adicionar uma nova localização
app.post('/localizacao', (req, res) => {
  const { nome, cor } = req.body;

  if (!nome || !cor) {
    return res.status(400).json({ message: 'Nome e cor da localização são obrigatórios' });
  }

  const insertQuery = 'INSERT INTO localizacao (nome, cor) VALUES (?, ?)'; // Incluído o campo "cor" na inserção

  connection.query(insertQuery, [nome, cor], (error, results) => {
    if (error) {
      console.error('Erro durante a inserção:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    const localizacaoId = results.insertId;
    res.json({
      id: localizacaoId,
      message: 'Localização adicionada com sucesso!'
    });
  });
});

// Endpoint para obter todas as localizações
app.get('/localizacao', (req, res) => {
  const query = 'SELECT * FROM localizacao';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Erro durante a consulta:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ localizacoes: results });
  });
});

// Endpoint para obter todos os itens
app.get('/items', (req, res) => {
  const selectQuery = `
    SELECT 
      i.id, i.itemName, i.entryDate, i.description, i.ip, i.tombo, i.codItems, 
      l.nome AS location, l.cor
    FROM items i
    INNER JOIN localizacao l ON i.localizacao_id = l.id
  `;

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Erro ao buscar itens:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ items: results });
  });
});



// Endpoint para obter um item específico pelo ID
app.get('/items/:id', (req, res) => {
  const id = req.params.id;
  console.log("ID requisitado:", id);

  const query = 'SELECT * FROM items WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Erro durante a consulta:", error);
      return res.status(500).send(error);
    }
    console.log("Resultado da consulta:", results);

    if (results.length === 0) return res.status(404).send({ message: "Item não encontrado" });
    res.json(results[0]);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}.`);
});
