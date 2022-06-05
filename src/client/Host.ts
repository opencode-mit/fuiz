import assert from "assert";
import { GameConfig, SessionID, Hash, Action } from "../types";
import { ClientSocket, makeConnectedSocket } from "./ClientSocket";
import { url } from "./FuizClient";
import * as drawing from "./Drawing";

export class Host {
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;
    private socket: ClientSocket | undefined;

    public constructor() { }

    public async startGame(config: GameConfig): Promise<void> {
        const request = fetch(url + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jsonConfig: config })
        });
        const json = await (await request).json();
        this.sessionID = json["sessionID"];
        this.token = json["token"];
        this.socket = await makeConnectedSocket(json["sessionID"], (sessionID, message) => this.onReciveAction(sessionID, message));
        const watchRequest = fetch(url + '/watchSocket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: json["sessionID"], socketID: this.socket.id })
        });
        drawing.showHostStartingScreen(json["sessionID"], [], 0);
    }

    public async resolveAction(actionID: number): Promise<Response> {
        //TODO: USE WEBSOCKETS
        assert(this.token !== undefined && this.sessionID !== undefined);
        return fetch(url + '/resolve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: this.sessionID, token: this.token, actionID: actionID })
        });
    }

    private onReciveAction(sessionID: SessionID, action: Action): void {
        if (sessionID != this.sessionID) return;
        if (action.type === 'question_only') {
            drawing.showQuestionOnly(action.content);
        } else if(action.type === 'question') {
            const id = action.actionID;
            if(id !== undefined) {
                drawing.showHostQuestion(action, id);
            } else {
                drawing.showQuestion(action);
            }
        } else if(action.type === 'leaderboard') {
            const id = action.actionID;
            if(id !== undefined) {
                drawing.showHostLeaderboard(action.results, id);
            } else {
                drawing.showLeaderboard(action.results);
            }
        }
    }
}