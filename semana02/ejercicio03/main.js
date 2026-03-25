const http = require("http");
const repo = require("./repository/studentsRepository");

const server = http.createServer((req, res) => {

  const { url, method } = req;

  res.setHeader("Content-Type", "application/json");

  // GET /students -> listar todos
  if (url === "/students" && method === "GET") {
    const students = repo.getAll();
    res.statusCode = 200;
    res.end(JSON.stringify(students));
  }

  // POST /students -> crear estudiante con validación
  else if (url === "/students" && method === "POST") {

    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {

      try {
        const data = JSON.parse(body);

        // VALIDACIÓN (lo que pide la tarea)
        if (!data.name || !data.email || !data.career || !data.phone) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Datos incompletos" }));
          return;
        }

        const newStudent = repo.create(data);

        res.statusCode = 201;
        res.end(JSON.stringify(newStudent));

      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "JSON inválido" }));
      }

    });
  }

  // POST /ListByStatus -> listar por estado
  else if (url === "/ListByStatus" && method === "POST") {

    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {

      const data = JSON.parse(body);

      const result = repo.getAll().filter(
        s => s.status === data.status
      );

      res.statusCode = 200;
      res.end(JSON.stringify(result));

    });
  }

  // POST /ListByGrade -> listar por promedio
  else if (url === "/ListByGrade" && method === "POST") {

    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {

      const data = JSON.parse(body);

      const result = repo.getAll().filter(
        s => s.grade >= data.grade
      );

      res.statusCode = 200;
      res.end(JSON.stringify(result));

    });
  }

  // endpoint no encontrado
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Endpoint no encontrado" }));
  }

});

server.listen(4000, () => {
  console.log("Servidor corriendo en http://localhost:4000");
});