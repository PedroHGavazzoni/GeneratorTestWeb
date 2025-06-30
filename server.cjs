const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const SECRET = "sua_chave_secreta"; // Troque por uma chave forte e segura

const app = express();
app.use(express.json(), cors());

const config = {
  user: "maicon",
  password: "maicon123",
  server: "localhost",
  database: "ProvasOnline",
  options: { encrypt: false },
};

sql
  .connect(config)
  .then(() =>
    app.listen(5000, "0.0.0.0", () =>
      console.log("API rodando em http://localhost:5000")
    )
  )
  .catch((err) => console.error("Erro ao conectar ao SQL Server:", err));

// Middleware de autenticação
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Token não fornecido" });
  const [, token] = auth.split(" ");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Rota de login (exemplo)
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  const result = await sql.query`
    SELECT Id, Nome, Email FROM Usuarios WHERE Email = ${email} AND Senha = ${senha}
  `;
  const user = result.recordset[0];
  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

  const token = jwt.sign(
    { id: user.Id, name: user.Nome, email: user.Email },
    SECRET,
    { expiresIn: "8h" }
  );
  res.json({ user, token });
});

// Buscar questão por ID (com alternativas)
app.get("/api/questoes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const questaoResult = await sql.query`
      SELECT Id AS IdQuestao, Titulo, Disciplina, AssuntosJson FROM Questoes WHERE Id = ${id}
    `;
    if (!questaoResult.recordset[0])
      return res.status(404).send("Questão não encontrada");

    const alternativasResult = await sql.query`
      SELECT Id, Descricao, Correta FROM Alternativas WHERE QuestaoId = ${id}
    `;
    const questao = questaoResult.recordset[0];
    res.json({
      ...questao,
      Assuntos: JSON.parse(questao.AssuntosJson || "[]"),
      alternatives: alternativasResult.recordset,
    });
  } catch (err) {
    res.status(500).send("Erro ao buscar questão");
  }
});

// Listar questões (com filtro)
app.get("/api/questoes", async (req, res) => {
  try {
    let query =
      "SELECT Id AS IdQuestao, Titulo, Disciplina, AssuntosJson FROM Questoes WHERE 1=1";
    const params = [];
    if (req.query.disciplina) {
      query += " AND Disciplina = @disciplina";
      params.push({ name: "disciplina", value: req.query.disciplina });
    }
    // Filtro por assunto (busca no JSON)
    if (req.query.assunto) {
      query += " AND AssuntosJson LIKE @assunto";
      params.push({ name: "assunto", value: `%${req.query.assunto}%` });
    }
    const request = new sql.Request();
    params.forEach((p) => request.input(p.name, p.value));
    const result = await request.query(query);
    res.json(
      result.recordset.map((q) => ({
        IdQuestao: q.IdQuestao,
        Titulo: q.Titulo,
        Disciplina: q.Disciplina,
        Assuntos: JSON.parse(q.AssuntosJson || "[]"),
      }))
    );
  } catch (err) {
    res.status(500).send("Erro ao buscar questões");
  }
});

// Criar questão (e alternativas)
app.post("/api/questoes", async (req, res) => {
  try {
    const { Titulo, Disciplina, Assuntos, alternatives } = req.body;
    const assuntosJson = JSON.stringify(Assuntos || []);
    const insertQuestao = await sql.query`
      INSERT INTO Questoes (Titulo, Disciplina, AssuntosJson)
      OUTPUT INSERTED.Id
      VALUES (${Titulo}, ${Disciplina}, ${assuntosJson})
    `;
    const questaoId = insertQuestao.recordset[0].Id;
    // Salva alternativas se vierem
    if (alternatives && Array.isArray(alternatives)) {
      for (const alt of alternatives) {
        await sql.query`
          INSERT INTO Alternativas (Descricao, Correta, QuestaoId)
          VALUES (${alt.description}, ${alt.isCorrect}, ${questaoId})
        `;
      }
    }
    res
      .status(201)
      .json({ IdQuestao: questaoId, Titulo, Disciplina, Assuntos });
  } catch (err) {
    res.status(500).send("Erro ao criar questão");
  }
});

// Atualizar questão (e alternativas)
app.put("/api/questoes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Titulo, Disciplina, Assuntos, alternatives } = req.body;
    const assuntosJson = JSON.stringify(Assuntos || []);
    await sql.query`
      UPDATE Questoes SET Titulo = ${Titulo}, Disciplina = ${Disciplina}, AssuntosJson = ${assuntosJson}
      WHERE Id = ${id}
    `;
    // Remove alternativas antigas e insere novas
    await sql.query`DELETE FROM Alternativas WHERE QuestaoId = ${id}`;
    if (alternatives && Array.isArray(alternatives)) {
      for (const alt of alternatives) {
        await sql.query`
          INSERT INTO Alternativas (Descricao, Correta, QuestaoId)
          VALUES (${alt.description}, ${alt.isCorrect}, ${id})
        `;
      }
    }
    res.json({ IdQuestao: id, Titulo, Disciplina, Assuntos });
  } catch (err) {
    res.status(500).send("Erro ao atualizar questão");
  }
});

// Remover questão
app.delete("/api/questoes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await sql.query`DELETE FROM Alternativas WHERE QuestaoId = ${id}`;
    await sql.query`DELETE FROM Questoes WHERE Id = ${id}`;
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send("Erro ao remover questão");
  }
});

// Rotas de provas (mantém igual, só ajuste se precisar de alternativas das questões)

// Exemplo para server.cjs
app.post("/api/provas", async (req, res) => {
  try {
    const { Disciplina, Titulo, IdsQuestoes } = req.body;
    if (
      !Disciplina ||
      !Titulo ||
      !Array.isArray(IdsQuestoes) ||
      IdsQuestoes.length === 0
    ) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // Verifica se todas as questões existem
    const idsStr = IdsQuestoes.join(",");
    const questoesResult = await sql.query(
      `SELECT Id FROM Questoes WHERE Id IN (${idsStr})`
    );
    if (questoesResult.recordset.length !== IdsQuestoes.length) {
      return res
        .status(400)
        .json({ error: "Uma ou mais questões não existem" });
    }

    // Cria a prova
    const insertProva = await sql.query`
      INSERT INTO Provas (Disciplina, Titulo)
      OUTPUT INSERTED.Id
      VALUES (${Disciplina}, ${Titulo})
    `;
    const provaId = insertProva.recordset[0].Id;

    // Relaciona as questões
    for (const questaoId of IdsQuestoes) {
      await sql.query`
        INSERT INTO ProvaQuestao (ProvaId, QuestaoId)
        VALUES (${provaId}, ${questaoId})
      `;
    }

    res.status(201).json({ IdProva: provaId, Disciplina, Titulo, IdsQuestoes });
  } catch (err) {
    console.error("Erro ao criar prova:", err);
    res.status(500).json({ error: "Erro ao criar prova" });
  }
});

// Listar provas
app.get("/api/provas", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT P.Id AS IdProva, P.Titulo, P.Disciplina, COUNT(PQ.QuestaoId) AS QuantidadeQuestoes
      FROM Provas P
      LEFT JOIN ProvaQuestao PQ ON PQ.ProvaId = P.Id
      GROUP BY P.Id, P.Titulo, P.Disciplina
      ORDER BY P.Id DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Erro ao buscar provas");
  }
});

// Buscar prova por ID (com questões)
app.get("/api/provas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const provaResult = await sql.query`
      SELECT Id AS IdProva, Titulo, Disciplina FROM Provas WHERE Id = ${id}
    `;
    if (!provaResult.recordset[0])
      return res.status(404).send("Prova não encontrada");

    const questoesResult = await sql.query`
      SELECT Q.Id AS IdQuestao, Q.Titulo, Q.Disciplina, Q.AssuntosJson
      FROM ProvaQuestao PQ
      JOIN Questoes Q ON Q.Id = PQ.QuestaoId
      WHERE PQ.ProvaId = ${id}
    `;
    const questoes = questoesResult.recordset.map((q) => ({
      IdQuestao: q.IdQuestao,
      Titulo: q.Titulo,
      Disciplina: q.Disciplina,
      Assuntos: JSON.parse(q.AssuntosJson || "[]"),
    }));

    res.json({
      ...provaResult.recordset[0],
      QuantidadeQuestoes: questoes.length,
      Questoes: questoes,
    });
  } catch (err) {
    res.status(500).send("Erro ao buscar prova");
  }
});

// Atualizar prova
app.put("/api/provas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { Disciplina, Titulo, IdsQuestoes } = req.body;
    if (
      !Disciplina ||
      !Titulo ||
      !Array.isArray(IdsQuestoes) ||
      IdsQuestoes.length === 0
    ) {
      return res.status(400).json({ error: "Dados inválidos" });
    }
    await sql.query`
      UPDATE Provas SET Disciplina = ${Disciplina}, Titulo = ${Titulo} WHERE Id = ${id}
    `;
    await sql.query`DELETE FROM ProvaQuestao WHERE ProvaId = ${id}`;
    for (const questaoId of IdsQuestoes) {
      await sql.query`
        INSERT INTO ProvaQuestao (ProvaId, QuestaoId) VALUES (${id}, ${questaoId})
      `;
    }
    res.json({ IdProva: id, Disciplina, Titulo, IdsQuestoes });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar prova" });
  }
});

// Remover prova
app.delete("/api/provas/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await sql.query`DELETE FROM ProvaQuestao WHERE ProvaId = ${id}`;
    await sql.query`DELETE FROM Provas WHERE Id = ${id}`;
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover prova" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const totalQuestoes =
      await sql.query`SELECT COUNT(*) AS total FROM Questoes`;
    const totalProvas = await sql.query`SELECT COUNT(*) AS total FROM Provas`;
    res.json({
      totalQuestoes: totalQuestoes.recordset[0].total,
      totalProvas: totalProvas.recordset[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar dados do dashboard" });
  }
});
