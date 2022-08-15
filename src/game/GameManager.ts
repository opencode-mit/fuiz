import assert from 'assert';
import { Server as HTTPServer } from 'http';
import { ServerSocket } from "../server/ServerSocket";
import { Action, GameConfig, PlayerID, SocketID, SessionID, Hash, AuthenticationError, HASH_LENGTH, SESSION_ID_LENGTH, EASY_ALPHABET, ALPHABET, GameResponse, GameResponseType, JoiningError } from "../types";
import { Gamemode, createGame } from "./Gamemode";
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
        this.socketManager = new ServerSocket(server, (sessionID, message) => this.receiveResponse(sessionID, message));
    }

    /**
     * Registers a new game with given configuration
     * 
     * @param config Game Configuration
     * @returns the newly assigned SessionID and the secret Hash
     */
    public registerHost(config: GameConfig): { sessionID: SessionID, token: Hash } {
        const nextSessionID = getRandomSessionID(Array.from(this.mapping.keys()));
        const token = getRandomHash();
        const announceFunc = (action: Action) => this.announceAction(nextSessionID, action);
        const game = createGame(config, announceFunc);
        this.mapping.set(nextSessionID, { token: token, game: game, users: new Map() });
        return { sessionID: nextSessionID, token: token };
    }

    /**
     * Subscribes the listener to announcment of the given game
     * 
     * @param sessionID the sessionID of the game
     * @param socketID the socketID of the listener
     */
    public registerSocket(sessionID: SessionID, socketID: SocketID): void {
        assert(this.socketManager !== undefined);
        this.socketManager.addToSession(socketID, sessionID);
    }

    /**
     * Registers a player as a listener for a given game under a name
     * 
     * @param socketID SocketID of the player for announcing actions
     * @param sessionID the SessionID of the game
     * @param playerID the player's ID
     * @returns the verificaion hash and last action announced by the the game
     */
    public registerPlayer(socketID: SocketID, sessionID: SessionID, playerID: PlayerID): { token: Hash, lastAction: Action } {
        const game = this.mapping.get(sessionID);
        if (game === undefined) throw new JoiningError("Game PID not found");
        if (game.users.get(playerID) !== undefined) throw new JoiningError("Name is already used");
        const playerToken = getRandomHash();
        game.users.set(playerID, playerToken);
        game.game.registerPlayer(playerID);
        this.registerSocket(sessionID, socketID);
        return { token: playerToken, lastAction: game.game.lastAction() };
    }

    /**
     * Announces an action to the watchers of the given SessionID
     * 
     * @param sessionID the SessionID of the game
     * @param action the action to be announced
     */
    private announceAction(sessionID: SessionID, action: Action): void {
        assert(this.socketManager !== undefined);
        this.socketManager.broadcast(sessionID, action);
    }

    /**
     * Resolves an action in a given game. Might cause the game to continue.
     * 
     * @param sessionID SessionID of the game
     * @param actionID the number of the action
     * @param token the secret hash for the given game
     */
    public resolveAction(sessionID: SessionID, actionID: number, token: Hash): void {
        const game = this.mapping.get(sessionID);
        if (game === undefined) throw new AuthenticationError("SessionID was not found");
        if (game.token !== token) throw new AuthenticationError("Host Token doesn't match");
        game.game.resolveAction(actionID);
    }

    /**
     * Handles an answer by a player for a question in a given game
     * 
     * @param sessionID SessionID of the game
     * @param playerID PlayerID of the player who submitted the answer
     * @param playerToken Player's Hash for verifican
     * @param questionID Number of the question
     * @param answerID Number of the answer
     */
    public submitAnswer(sessionID: SessionID, playerID: PlayerID, playerToken: Hash, questionID: number, answerID: number): void {
        const game = this.mapping.get(sessionID);
        if (game === undefined) throw new AuthenticationError("SessionID was not found");
        const userToken = game.users.get(playerID);
        if (userToken === undefined) throw new AuthenticationError("Player was not found");
        if (userToken !== playerToken) throw new AuthenticationError("Player Token doesn't match");
        game.game.submitAnswer(questionID, playerID, answerID);
    }

    /**
     * handles replies from the websockets
     * 
     * @param sessionID given session ID of the game
     * @param message the reply from the players
     */
    public receiveResponse(sessionID: SessionID, message: GameResponse): void {
        switch (message.type) {
            case GameResponseType.Answer:
                assert(message.sessionID !== undefined && message.playerID !== undefined && message.playerID !== undefined && message.questionID !== undefined && message.answerID !== undefined);
                this.submitAnswer(message.sessionID, message.playerID, message.playerToken, message.questionID, message.answerID);
                break;
            case GameResponseType.Resolve:
                assert(message.sessionID !== undefined && message.actionID !== undefined && message.token !== undefined);
                this.resolveAction(message.sessionID, message.actionID, message.token);
                break;
        }
    }
}