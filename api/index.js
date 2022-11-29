"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const assert_1 = __importDefault(require("assert"));
const config_1 = require("../dist/config");
const GameManager_1 = require("../dist/game/GameManager");
const WebServer_1 = require("../dist/server/WebServer");
async function main() {
    const gameManager = new GameManager_1.GameManager();
    const server = new WebServer_1.WebServer(gameManager, config_1.PORT);
    await server.start();
    (0, assert_1.default)(server.server !== undefined);
    gameManager.setSocketManager(server.server);
}
exports.main = main;
if (require.main === module) {
    void main();
}
//# sourceMappingURL=FuizServer.js.map