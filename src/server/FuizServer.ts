import assert from "assert";
import { GameManager } from "../game/GameManager";
import { WebServer } from './WebServer';

async function main(): Promise<void> {
    const gameManager = new GameManager();
    const server: WebServer = new WebServer(gameManager, 8888);
    await server.start();
    assert(server.server !== undefined);
    gameManager.setSocketManager(server.server);
}

if (require.main === module) {
    void main();
}
