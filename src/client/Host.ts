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

    public resolveAction(actionID: number): void {
        //TODO: USE WEBSOCKETS
        assert(this.token !== undefined && this.sessionID !== undefined);
        this.socket?.sendMessage({
            type: 'resolve',
            sessionID: this.sessionID,
            actionID: actionID,
            token: this.token
        })
    }

    private onReciveAction(sessionID: SessionID, action: Action): void {
        if (sessionID != this.sessionID) return;
        if (action.type === 'question_only') {
            drawing.showQuestionOnly(action.content);
        } else if(action.type === 'question') {
            const id = action.actionID;
            if(id !== undefined) {
                drawing.showHostQuestion(action, id, action.questionID);
            } else {
                drawing.showQuestion(action, action.questionID);
            }
        } else if(action.type === 'leaderboard') {
            const id = action.actionID;
            if(id !== undefined) {
                drawing.showHostLeaderboard(action.results, id);
            } else {
                drawing.showLeaderboard(action.results);
            }
        } else if (action.type === 'join') {
            drawing.showHostStartingScreen(this.sessionID, action.people, 0);
        } else if (action.type === 'statistics') {
            const id = action.actionID;
            if(id !== undefined) {
                drawing.showHostStatistics(action.question, action.answers, id, action.question.questionID);
            } else {
                drawing.showStatistics(action.question, action.answers, action.question.questionID, 0); //TODO: REMOVE THIS
            }
        }
    }
}