import amqp from "amqplib";
import {
  clientWelcome,
  commandStatus,
  getInput,
  printClientHelp,
  printQuit,
} from "../internal/gamelogic/gamelogic.js";
import {
  declareAndBind,
  publishJSON,
  subscribeJSON,
} from "../internal/pubsub/index.js";
import {
  ArmyMovesPrefix,
  ExchangePerilDirect,
  ExchangePerilTopic,
  PauseKey,
} from "../internal/routing/routing.js";
import {
  GameState,
  type PlayingState,
} from "../internal/gamelogic/gamestate.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { commandMove, handleMove } from "../internal/gamelogic/move.js";
import { handlePause } from "../internal/gamelogic/pause.js";
import type { ArmyMove } from "../internal/gamelogic/gamedata.js";

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
  const gameState = new GameState(name);

  await subscribeJSON(
    conn,
    ExchangePerilDirect,
    `${PauseKey}.${name}`,
    PauseKey,
    "transient",
    handlerPause(gameState)
  );
  await subscribeJSON(
    conn,
    ExchangePerilTopic,
    `${ArmyMovesPrefix}.${name}`,
    `${ArmyMovesPrefix}.*`,
    "transient",
    handlerMove(gameState)
  );

  while (true) {
    let input = await getInput();
    switch (input[0]) {
      case "spawn": {
        console.log(input);
        commandSpawn(gameState, input);
        break;
      }
      case "move": {
        const armyMove = commandMove(gameState, input);

        if (armyMove) {
          const channel = await conn.createConfirmChannel();
          await publishJSON(
            channel,
            ExchangePerilTopic,
            `${ArmyMovesPrefix}.*`,
            armyMove
          );
          console.log("The move was successful");
          channel.close();
        }
        break;
      }
      case "status": {
        commandStatus(gameState);
        break;
      }
      case "help": {
        printClientHelp();
        break;
      }
      case "quit": {
        printQuit();
        process.exit();
      }
      default: {
        console.log("Command not found");
        continue;
      }
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

export function handlerPause(gs: GameState): (ps: PlayingState) => void {
  return (ps: PlayingState) => {
    handlePause(gs, ps);
    process.stdout.write("> ");
  };
}

export function handlerMove(gs: GameState): (move: ArmyMove) => void {
  return (move: ArmyMove) => {
    handleMove(gs, move);
    process.stdout.write("> ");
  };
}
