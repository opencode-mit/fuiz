type hash = string;
type sessionID = string;
type playerID = string;
type userTokens = Map<playerID, hash>;
import {Gamemode, createGame} from "./Gamemode";

function getRandomSessionID(existing: sessionID[]): sessionID {
    return "ABC123"; //TODO: Implement me
}

function getRandomHash(): hash {
    return "123oijasd"; //TODO: Implement me
}

class Server {
    private readonly mapping = new Map<sessionID, {token: hash, game: Gamemode, users: userTokens}>();

    public constructor() {};

    public registerHost(config: JSON) : {sessionID: sessionID, token: hash} {
        const nextSessionID = getRandomSessionID(Array.from(this.mapping.keys()));
        const token = getRandomHash();
        this.mapping.set(nextSessionID, {token: token, game: createGame(config), users: new Map()});
        return {sessionID: nextSessionID, token: token};
    }

    public registerPlayer(sessionID: sessionID, playerID: playerID): hash | undefined {
        const game = this.mapping.get(sessionID);
        if (game === undefined) return undefined;
        const playerToken = getRandomHash();
        game.users.set(playerID, playerToken);
        return playerToken;
    }
}