import { Action, GameConfig, PlayerID, SessionID, Hash, AuthenticationError } from "../types";
import { Gamemode, createQuiz } from "./Gamemode";
type UserTokens = Map<PlayerID, Hash>;

const randInt = (n: number) => Math.floor(Math.random() * n);

/**
 * Generates an easy to read session id that's different from existing session ids.
 * @param existing an array of existing session ids
 * @returns a new session id
 */
function getRandomSessionID(existing: SessionID[]): SessionID {
    const easyAlphabet = "023456789ACDEFGHJKLOQRSTUVWXYZ"; // broad research concludes that these letters are easy to say
    const length = 6;
    let result: SessionID; // assuming string
    do {
        result = "";
        for (let i = 0; i < length; i++) {
            result += easyAlphabet[randInt(easyAlphabet.length)];
        }
    } while(existing.includes(result));
    return result;
}

/**
 * @returns a random hash
 */
function getRandomHash(): Hash {
    const alphabet = "abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890";
    const length = 32;
    let result: Hash = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[randInt(alphabet.length)];
    }
    return result;
}

export class GameManager {
    private readonly mapping = new Map<SessionID, { token: Hash, game: Gamemode, users: UserTokens }>();

    public constructor() { };

    public registerHost(config: GameConfig): { sessionID: SessionID, token: Hash } {
        const nextSessionID = getRandomSessionID(Array.from(this.mapping.keys()));
        const token = getRandomHash();
        const announceFunc = (action: Action) => this.announceAction(nextSessionID, action);
        this.mapping.set(nextSessionID, { token: token, game: createQuiz(config, announceFunc), users: new Map() });
        return { sessionID: nextSessionID, token: token };
    }

    public registerPlayer(sessionID: SessionID, playerID: PlayerID): Hash | undefined {
        //TODO: Add Websocket functionality
        const game = this.mapping.get(sessionID);
        if (game === undefined) return undefined;
        const playerToken = getRandomHash();
        game.users.set(playerID, playerToken);
        return playerToken;
    }

    private announceAction(sessionID: SessionID, action: Action): void {
        console.log(action);
        //TODO: Implement me using websockets
    }

    public resolveAction(sessionID: SessionID, actionID: number, token: Hash): void {
        const game = this.mapping.get(sessionID);
        if(game === undefined) throw new AuthenticationError("SessionID was not found");
        if(game.token !== token) throw new AuthenticationError("Host Token doesn't match");
        game.game.resolveAction(actionID);
    }
    
    public submitAnswer(sessionID: SessionID, playerID: PlayerID, playerToken: Hash, questionID: number,answerID: number): void {
        const game = this.mapping.get(sessionID);
        if(game === undefined) throw new AuthenticationError("SessionID was not found");
        const userToken = game.users.get(playerID);
        if(userToken === undefined) throw new AuthenticationError("Player was not found");
        if(userToken !== playerToken) throw new AuthenticationError("Player Token doesn't match");
        game.game.submitAnswer(questionID, playerID, answerID);
    }
}