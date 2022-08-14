import assert from "assert";
import { PORT } from "../config";
import { GameManager } from "../game/GameManager";
import { WebServer } from './WebServer';

async function main(): Promise<void> {
    const gameManager = new GameManager();
    const server: WebServer = new WebServer(gameManager, PORT);
    await server.start();
    assert(server.server !== undefined);
    gameManager.setSocketManager(server.server);
}

if (require.main === module) {
    void main();
}
