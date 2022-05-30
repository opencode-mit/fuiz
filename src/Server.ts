import { Action, GameConfig, PlayerID, SessionID, Hash, AuthenticationError } from ".";
import { Gamemode, createGame } from "./Gamemode";
type UserTokens = Map<PlayerID, Hash>;

function getRandomSessionID(existing: SessionID[]): SessionID {
    return "ABC123"; //TODO: Implement me
}

function getRandomHash(): Hash {
    return "123oijasd"; //TODO: Implement me
}

class Server {
    private readonly mapping = new Map<SessionID, { token: Hash, game: Gamemode, users: UserTokens }>();

    public constructor() { };

    public registerHost(config: GameConfig): { sessionID: SessionID, token: Hash } {
        const nextSessionID = getRandomSessionID(Array.from(this.mapping.keys()));
        const token = getRandomHash();
        const announceFunc = (action: Action) => this.announceAction(nextSessionID, action);
        this.mapping.set(nextSessionID, { token: token, game: createGame(config, announceFunc), users: new Map() });
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

export { Server as GameManager };