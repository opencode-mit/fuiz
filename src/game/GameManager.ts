import assert from 'assert';
import { Server as HTTPServer } from 'http';
import { ServerSocket } from "../server/ServerSocket";
import { Action, GameConfig, PlayerID, SocketID, SessionID, Hash, AuthenticationError, HASH_LENGTH, SESSION_ID_LENGTH, EASY_ALPHABET, ALPHABET } from "../types";
import { Gamemode, createQuiz } from "./Gamemode";
type UserTokens = Map<PlayerID, Hash>;

const randInt = (n: number) => Math.floor(Math.random() * n);
const randElt = (a: string) => a[randInt(a.length)] ?? "";
const randStr = (n: number, a: string) => Array(n).fill("").map(() => randElt(a)).join("");

/**
 * Generates an easy to read session id that's different from existing session ids.
 * @param existing an array of existing session ids
 * @returns a new session id
 */
function getRandomSessionID(existing: SessionID[]): SessionID {
    const length = SESSION_ID_LENGTH;
    let result: SessionID; // assuming string
    do {
        result = randStr(SESSION_ID_LENGTH, EASY_ALPHABET);
    } while (existing.includes(result));
    return result;
}

/**
 * @returns a random hash
 */
function getRandomHash(): Hash {
    return randStr(HASH_LENGTH, ALPHABET);
}

export class GameManager {
    private readonly mapping = new Map<SessionID, { token: Hash, game: Gamemode, users: UserTokens }>();
    private socketManager: ServerSocket | undefined;

    public constructor() { };

    public setSocketManager(server: HTTPServer) {
        this.socketManager = new ServerSocket(server, (m) => {console.log(m)});
    }

    public registerHost(config: GameConfig): { sessionID: SessionID, token: Hash } {
        const nextSessionID = getRandomSessionID(Array.from(this.mapping.keys()));
        const token = getRandomHash();
        const announceFunc = (action: Action) => this.announceAction(nextSessionID, action);
        this.mapping.set(nextSessionID, { token: token, game: createQuiz(config, announceFunc), users: new Map() });
        return { sessionID: nextSessionID, token: token };
    }

    public registerPlayer(socketID: SocketID, sessionID: SessionID, playerID: PlayerID): Hash | undefined {
        assert(this.socketManager !== undefined);
        this.socketManager.addToSession(socketID, sessionID);
        const game = this.mapping.get(sessionID);
        if (game === undefined) return undefined;
        const playerToken = getRandomHash();
        game.users.set(playerID, playerToken);
        return playerToken;
    }

    private announceAction(sessionID: SessionID, action: Action): void {
        assert(this.socketManager !== undefined);
        console.log(action);
        this.socketManager.broadcast(sessionID, action);
    }

    public resolveAction(sessionID: SessionID, actionID: number, token: Hash): void {
        const game = this.mapping.get(sessionID);
        if (game === undefined) throw new AuthenticationError("SessionID was not found");
        if (game.token !== token) throw new AuthenticationError("Host Token doesn't match");
        game.game.resolveAction(actionID);
    }

    public submitAnswer(sessionID: SessionID, playerID: PlayerID, playerToken: Hash, questionID: number, answerID: number): void {
        const game = this.mapping.get(sessionID);
        if (game === undefined) throw new AuthenticationError("SessionID was not found");
        const userToken = game.users.get(playerID);
        if (userToken === undefined) throw new AuthenticationError("Player was not found");
        if (userToken !== playerToken) throw new AuthenticationError("Player Token doesn't match");
        game.game.submitAnswer(questionID, playerID, answerID);
    }
}