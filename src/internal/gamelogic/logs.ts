import fs from "fs";

export interface GameLog {
  timestamp: Date;
  message: string;
  username: string;
}

const logsFile = "~/projects/pub-sub/game.log";
const writeToDiskSleep = 1000;

function block(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

export async function writeLog(gameLog: GameLog): Promise<void> {
  console.log("received game log...");
  block(writeToDiskSleep);

  const date = new Date(gameLog.timestamp);
  const timestamp = date.toISOString();
  const logEntry = `${timestamp} ${gameLog.username}: ${gameLog.message}\n`;

  fs.appendFile(logsFile, logEntry, { flag: "a" }, (err) => {
    if (err) {
      console.error(`could not write to logs file: ${err}`);
      return;
    }
  });
}
