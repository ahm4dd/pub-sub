# Peril - Risk-Style Game with RabbitMQ Pub/Sub

A multiplayer strategy game implementation inspired by the classic board game Risk, built to demonstrate message-driven architecture using RabbitMQ and TypeScript.

## What This Project Does

Peril simulates a territorial conquest game where players spawn military units across continents and engage in warfare. The twist? Everything happens through asynchronous messaging. When you move troops, declare war, or write to the game log, you're publishing messages to RabbitMQ exchanges. Other players subscribe to these messages and react accordingly.

This is about understanding how distributed systems communicate. How do multiple game clients stay synchronized? How do you handle player actions that trigger reactions in other players' games? How do you route messages so they only reach relevant subscribers? This project answers those questions.

## Prerequisites

You'll need these installed:
- **Node.js** (v18 or higher recommended)
- **Docker** (for running RabbitMQ)
- **npm** (comes with Node.js)

For Arch Linux users:
```bash
sudo pacman -S nodejs npm docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER  # Log out and back in after this
```

For Debian/Ubuntu:
```bash
sudo apt update
sudo apt install nodejs npm docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

For Fedora/RHEL:
```bash
sudo dnf install nodejs npm docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

For macOS (using Homebrew):
```bash
brew install node
brew install --cask docker
# Start Docker Desktop from Applications
```

## Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/ahm4dd/peril
cd peril
npm install
```

Start the RabbitMQ message broker:

```bash
npm run rabbit:start
```

This spins up a Docker container running RabbitMQ with the management plugin and STOMP protocol enabled. The management UI will be available at `http://localhost:15672` (username: `guest`, password: `guest`).

## Running the Game

You need at least two terminal windows: one for the server and one for each client.

**Terminal 1 - Start the server:**
```bash
npm run server
```

**Terminal 2 - Start your first client:**
```bash
npm run client
```

**Terminal 3 - Start a second client:**
```bash
npm run client
```

Each client will prompt you for a username. Pick different names for each player.

## How to Play

### Available Commands

**Client Commands:**
- `spawn <location> <rank>` - Create a new unit
  - Locations: `americas`, `europe`, `africa`, `asia`, `australia`, `antarctica`
  - Ranks: `infantry`, `cavalry`, `artillery`
  - Example: `spawn europe infantry`

- `move <location> <unitID> [unitID...]` - Move one or more units
  - Example: `move asia 1 2`

- `status` - View your current units and game state

- `spam <n>` - Send n malicious game log messages (for testing message handling)

- `help` - Show available commands

- `quit` - Exit the game

**Server Commands:**
- `pause` - Pause all connected games
- `resume` - Resume all games
- `quit` - Shut down the server
- `help` - Show available commands

### Basic Gameplay Flow

1. Each player spawns units in different locations
2. Move units around the map using their IDs
3. When two players have units in the same location, war is automatically declared
4. Combat is resolved based on unit power levels:
   - Infantry: 1 power
   - Cavalry: 5 power  
   - Artillery: 10 power
5. The player with higher total power in that location wins
6. Losing units are removed from the game

### Example Session

```bash
> spawn europe infantry
Spawned a(n) infantry in europe with id 1

> spawn europe artillery
Spawned a(n) artillery in europe with id 2

> move asia 1 2
Moved 2 units to asia
```

When another player moves units to the same location, you'll see:

```
==== Move Detected ====
Alice is moving 2 unit(s) to asia
* cavalry
* infantry
You have units in asia! You are at war with Alice!
------------------------
```

## Features

### Message Patterns

**Topic Exchange (peril_topic)**
- Army movements broadcast to all players with pattern-based routing
- War declarations sent to specific players using topic keys
- Game logs published with username-based routing

**Direct Exchange (peril_direct)**
- Pause/resume commands sent directly to all clients
- Targeted messaging for game state control

**Dead Letter Exchange (peril_dlx)**
- Failed messages automatically routed to DLX for debugging
- Handles rejected and undeliverable messages

### Queue Types

**Transient Queues**
- Auto-deleted when clients disconnect
- Used for real-time events like moves and pauses
- Exclusive to each client connection

**Durable Queues**
- Persist across client disconnections
- Used for war declarations and game logs
- Messages survive broker restarts

### Message Acknowledgment

The game demonstrates three acknowledgment strategies:
- `Ack` - Successfully processed, remove from queue
- `NackRequeue` - Processing failed, retry later
- `NackDiscard` - Invalid message, send to dead letter exchange

### Serialization

- **JSON** for game commands and state updates
- **MessagePack** for game logs (binary serialization for efficiency)

### Prefetch Limiting

Consumers prefetch up to 10 messages to balance throughput and memory usage.


## Stopping RabbitMQ

When you're done:

```bash
npm run rabbit:stop
```

To view RabbitMQ logs:

```bash
npm run rabbit:logs
```

## Building From Source

If you want to compile TypeScript to JavaScript:

```bash
npm run build
```

This generates JavaScript output based on the `tsconfig.json` settings.

---
