const http = require("http");

const TOTAL = 300;
const CONCURRENTES = 10;
let completados = 0;
let errores = 0;
let instancias = { "1": 0, "2": 0, "3": 0 };
const inicio = Date.now();

function hacerRequest() {
  return new Promise((resolve) => {
    http.get("http://localhost/health", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          instancias[json.instance] = (instancias[json.instance] || 0) + 1;
        } catch {}
        resolve();
      });
    }).on("error", () => { errores++; resolve(); });
  });
}

async function correr() {
  const lotes = Math.ceil(TOTAL / CONCURRENTES);
  for (let i = 0; i < lotes; i++) {
    const batch = [];
    for (let j = 0; j < CONCURRENTES && completados < TOTAL; j++) {
      completados++;
      batch.push(hacerRequest());
    }
    await Promise.all(batch);
  }
  const tiempo = ((Date.now() - inicio) / 1000).toFixed(2);
  console.log("\n========= STRESS TEST GOLEADOR =========");
  console.log(`Requests totales : ${TOTAL}`);
  console.log(`Concurrencia     : ${CONCURRENTES}`);
  console.log(`Tiempo total     : ${tiempo}s`);
  console.log(`Errores          : ${errores}`);
  console.log(`\nDistribucion Round Robin:`);
  console.log(`  Instancia 1: ${instancias["1"]} requests`);
  console.log(`  Instancia 2: ${instancias["2"]} requests`);
  console.log(`  Instancia 3: ${instancias["3"]} requests`);
  console.log("=========================================\n");
}

correr();
