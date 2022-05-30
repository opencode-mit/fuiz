import { GameConfig, SessionID, Hash } from "../types";
import { url } from "./FuizClient";

class Host {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;

    public constructor() { }

    public async startGame(config: GameConfig): Promise<void> {
        const json = await (await fetch(url + `/register/${JSON.stringify(config)}`)).json();
        this.sessionID = json["sessionID"];
        this.token = json["token"];
    }

    public async resolveAction(actionID: number): Promise<Response> {
        return fetch(url + `/resolve/${this.sessionID}/${this.token}/${actionID}`);
    }
}