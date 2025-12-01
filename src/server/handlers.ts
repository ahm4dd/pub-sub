import { writeLog, type GameLog } from "../internal/gamelogic/logs.js";
import type { AckType } from "../internal/pubsub/index.js";

export function handlerLog() {
  return async (gamelog: GameLog): Promise<AckType> => {
    try {
      writeLog(gamelog);
      return "Ack";
    } catch (err) {
      console.error("Error writing log:", err);
      return "NackDiscard";
    } finally {
      process.stdout.write("> ");
    }
  };
}
