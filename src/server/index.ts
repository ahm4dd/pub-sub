import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/index.js";
import { ExchangePerilDirect, PauseKey } from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
async function main() {
  console.log("Starting Peril server...");

  const connString = `amqp://guest:guest@localhost:5672/`;
  const conn = await amqp.connect(connString);

  console.log("Connected successfully");

  process.on("exit", async () => {
    console.log("\nProgram shutting down...");
    await conn.close();
  });

  const channel = await conn.createConfirmChannel();
  const playingState: PlayingState = {
    isPaused: true,
  };
  publishJSON(channel, ExchangePerilDirect, PauseKey, playingState);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
