const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');

const app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(cors({ origin: 'http://localhost:3000' }));

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Criando conexão com o banco
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // seu usuário
  password: '123', // sua senha
  database: 'etiqueta', // seu banco de dados
  timezone: '-03:00',  // Use UTC-3, por exemplo, para "America/Sao_Paulo"
  charset: 'utf8mb4', // Suporte a todos os caracteres UTF e emojis.
  connectTimeout: 10000, // Tempo em milissegundos antes de uma tentativa de conexão ser considerada falha
});

connection.connect((error) => {
  if (error) throw error;
  console.log('Conectado ao banco de dados MySQL.');
});


// Endpoint para adicionar um novo item
app.post('/items', (req, res) => {
  console.log('Corpo da requisição:', req.body);
  const { itemName, entryDate, location, description, ip, tombo } = req.body;

  if (!itemName || !entryDate || !location || !description || !ip || !tombo) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  // Utilize entryDate diretamente como formattedDate
  const formattedDate = entryDate;

  // Inserção inicial com um valor temporário para codItems
  const tempCodItems = 'TEMP';
  const insertQuery = 'INSERT INTO items (itemName, entryDate, location, description, codItems, ip, tombo) VALUES (?, ?, ?, ?, ?, ?, ?)';

  connection.query(insertQuery, [itemName, formattedDate, location, description, tempCodItems, ip, tombo], (error, results) => {
    if (error) {
      console.error('Erro durante a inserção:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    const itemId = results.insertId; // Capturando o ID inserido
    
    let codItems;
    if (itemId >= 10 ) {
      codItems = 'CCD00' + itemId;
    } else if (itemId >= 100) {
      codItems = 'CCD0' + itemId;
    } else if (itemId >= 1000) {
      codItems = 'CCD' + itemId;
    } else {
      codItems = 'CCD000' + itemId;
    }

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

// Endpoint para obter os detalhes de um item específico pelo ID
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

 // if (!itemName || !entryDate || !location || !description || !ip || !tombo) {
  //  return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
//}

  // Utilize entryDate diretamente como formattedDate
  const formattedDate = entryDate;

  const updateQuery = 'UPDATE items SET itemName = ?, entryDate = ?, location = ?, description = ?, ip = ?, tombo = ? WHERE id = ?';

  connection.query(updateQuery, [itemName, formattedDate, location, description, ip, tombo, id], (error, results) => {
    if (error) {
      console.error('Erro durante a atualização:', error);
      return res.status(500).json({ error: error.message, message: "Ocorreu um erro no servidor" });
    }

    console.log('Valores a serem atualizados:', { itemName, entryDate: formattedDate, location, description, ip, tombo, id });
    res.json({
      id,
      message: 'Item atualizado com sucesso!'
    });
  });
});



// Endpoint para obter todos os itens
app.get('/items', (req, res) => {
  connection.query('SELECT * FROM items', (error, results) => {
    if (error) {
      console.error('Erro durante a consulta:', error);
      return res.status(500).send(error);
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
