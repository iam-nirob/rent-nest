import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port || 5700;

async function server() {
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Server is running in PORT: ${PORT}`);
  });
  try {
  } catch (error: any) {
    console.error("Error starting in the server", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

console.log("Server reloaded at:", new Date().toISOString());
server();
