type Hash = string;
type UserTokens = Map<PlayerID, Hash>;
import { Action, GameConfig, PlayerID, SessionID } from ".";
import { Gamemode, createGame } from "./Gamemode";

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
        //TODO: Implement me using websockets
    }

    public resolveAction(sessionID: SessionID, actionID: number, token: Hash): void {
        const game = this.mapping.get(sessionID);
        if (game !== undefined && game.token === token) {
            game.game.resolveAction(actionID);
        } else {
            //raise error or something D:
        }
    }

    public submitAnswer(sessionID: SessionID, playerID: PlayerID, playerToken: Hash, questionID: number,answerID: number): void {
        const game = this.mapping.get(sessionID);
        if (game !== undefined) {
            const userToken = game.users.get(playerID);
            if (userToken !== undefined && userToken === playerToken) {
                game.game.submitAnswer(questionID, playerID, answerID);
            } else {
                //raise error or something D:
            }
        } else {
            //raise error or something D:
        }
    }
}