const http = require("http");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const PORT = 3000;

const server = http.createServer((req, res) => {

    // HOME
    if (req.url === "/") {

        const filePath = path.join(__dirname, "views", "home.hbs");

        fs.readFile(filePath, "utf8", (err, templateData) => {

            const template = handlebars.compile(templateData);

            const data = {
                title: "Servidor con Handlebars",
                welcomeMessage: "Bienvenido al laboratorio de Node.js",
                day: new Date().toLocaleDateString("es-PE"),
                students: ["Ana", "Luis", "Pedro", "Maria"]
            };

            const html = template(data);

            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);

        });
    }

    // ABOUT
    else if (req.url === "/about") {

        const filePath = path.join(__dirname, "views", "about.hbs");

        fs.readFile(filePath, "utf8", (err, templateData) => {

            const template = handlebars.compile(templateData);

            const html = template({
                date: new Date().toLocaleDateString("es-PE")
            });

            res.setHeader("Content-Type", "text/html");
            res.end(html);

        });
    }

    // STUDENTS
    else if (req.url === "/students") {

        const filePath = path.join(__dirname, "views", "students.hbs");

        fs.readFile(filePath, "utf8", (err, templateData) => {

            const template = handlebars.compile(templateData);

            const html = template({
                students: [
                    { name: "Ana", grade: 18, passed: true },
                    { name: "Luis", grade: 14, passed: false },
                    { name: "Pedro", grade: 16, passed: true },
                    { name: "Maria", grade: 12, passed: false }
                ]
            });

            res.setHeader("Content-Type", "text/html");
            res.end(html);

        });
    }

    else {
        res.statusCode = 404;
        res.end("<h1>404 - Página no encontrada</h1>");
    }

});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});