import { GameManager } from "./Server";
import { WebServer } from './WebServer';

async function main(): Promise<void> {
    const server: WebServer = new WebServer(new GameManager(), 8888);
    await server.start();
}

if (require.main === module) {
    void main();
}
