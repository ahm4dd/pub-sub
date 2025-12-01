import amqp from "amqplib";
import {
  declareAndBind,
  publishJSON,
  subscribeMsgPack,
} from "../internal/pubsub/index.js";
import {
  ExchangePerilDirect,
  ExchangePerilTopic,
  GameLogSlug,
  PauseKey,
} from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";
import { handlerLog } from "./handlers.js";
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

  await subscribeMsgPack(
    conn,
    ExchangePerilTopic,
    GameLogSlug,
    `${GameLogSlug}.*`,
    "durable",
    handlerLog()
  );

  printServerHelp();
  while (true) {
    const input = await getInput();
    if (input[0] === "pause") {
      console.log("You are sending a pause message");
      const playingState: PlayingState = {
        isPaused: true,
      };
      publishJSON(channel, ExchangePerilDirect, PauseKey, playingState);
    } else if (input[0] === "resume") {
      console.log("You are sending a resume message");
      const playingState: PlayingState = {
        isPaused: false,
      };
      publishJSON(channel, ExchangePerilDirect, PauseKey, playingState);
    } else if (input[0] === "quit") {
      console.log("Exiting...");
      break;
    } else {
      console.log("Command not found");
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
