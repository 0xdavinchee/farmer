import http from "http";

const port = 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("hello world");
});

server.listen(port, () => {
  console.log(`server running at port ${port}`);
  setInterval(() => console.log("do the farming here."), 2500);
});