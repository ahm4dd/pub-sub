import amqp from "amqplib";
async function main() {
  console.log("Starting Peril server...");
  const connString = `amqp://guest:guest@localhost:5672/`;
  let conn = await amqp.connect(connString);
  console.log("Connected successfully");
  process.on("exit", async () => {
    console.log("\nProgram shutting down...");
    await conn.close();
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
