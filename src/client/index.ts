import amqp from "amqplib";
import { clientWelcome } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind } from "../internal/pubsub/index.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";

async function main() {
  console.log("Starting Peril client...");

  const connString = "amqp://guest:guest@localhost:5672";
  const conn = await amqp.connect(connString);

  console.log("Connected successfully");

  process.on("exit", async () => {
    console.log("\nProgram shutting down...");
    await conn.close();
  });

  const name = await clientWelcome();
  const channelAndQueue = await declareAndBind(
    conn,
    ExchangePerilDirect,
    `${PauseKey}.${name}`,
    PauseKey,
    "transient"
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
