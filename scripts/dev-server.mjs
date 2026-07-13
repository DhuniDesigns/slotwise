import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";

const dev = true;
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

createServer((request, response) => {
  const parsedUrl = parse(request.url || "/", true);
  handle(request, response, parsedUrl);
}).listen(port, hostname, () => {
  console.log(`Slotwise ready on http://localhost:${port}`);
});
