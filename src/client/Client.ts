import { Action, Hash, PlayerID, SessionID } from "../types";
import { makeConnectedSocket, ClientSocket } from "./ClientSocket";
import { url } from "./FuizClient";
import * as drawing from "./Drawing";

export class Client {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;
    private socket: ClientSocket | undefined;

    public constructor() { }

    public async registerGame(playerID: PlayerID, sessionID: SessionID) {
        this.socket = await makeConnectedSocket(sessionID, (sessionID, message) => this.onReciveAction(sessionID, message));
        console.log({ socketID: this.socket.id, sessionID: sessionID, playerID: playerID });
        const request = fetch(url + '/registerPlayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ socketID: this.socket.id, sessionID: sessionID, playerID: playerID })
        });
        const json = await (await request).json();
        this.sessionID = sessionID;
        this.token = json["token"];
        drawing.showStartingScreen(sessionID, [playerID]);
    }

    private onReciveAction(sessionID: SessionID, action: Action): void {
        if (sessionID !== this.sessionID) return;
        if (action.type === 'question_only') {
            drawing.showQuestionOnly(action.content);
        } else if(action.type === 'question') {
            drawing.showQuestion(action);
        } else if(action.type === 'leaderboard') {
            drawing.showLeaderboard(action.results);
        }
    }
}