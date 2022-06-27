import assert from "assert";
import { GameConfig, SessionID, Hash, Action, Announcement } from "../types";
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
        drawing.showJoinWaitingHost(json["sessionID"], [], 0);
    }

    public resolveAction(actionID: number): void {
        assert(this.token !== undefined && this.sessionID !== undefined);
        this.socket?.sendMessage({
            type: 'resolve',
            sessionID: this.sessionID,
            actionID: actionID,
            token: this.token
        })
    }

    private onReciveAction(sessionID: SessionID, announcement: Announcement): void {
        const action = announcement.action;
        if (sessionID != this.sessionID) return;
        if (action.type === 'question_only') {
            const timeLeft = action.duration;
            drawing.showQuestionOnlyHost(action.content, action.actionID, timeLeft);
        } else if(action.type === 'question') {
            drawing.showQuestionHost(action.question, action.questionID, action.actionID);
        } else if(action.type === 'leaderboard') {
            drawing.showLeaderboardHost(action.results, action.actionID);
        } else if (action.type === 'join') {
            drawing.showJoinWaitingHost(this.sessionID, action.people, 0);
        } else if (action.type === 'statistics') {
            drawing.showStatisticsHost(action.question, action.answers, action.questionID, action.actionID);
        }
    }
}