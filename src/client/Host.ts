import assert from "assert";
import { GameConfig, SessionID, Hash, Action, Announcement, GameResponseType, ActionType } from "../types";
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
        this.socket = await makeConnectedSocket(json["sessionID"], (sessionID, message) => this.onReceiveAction(sessionID, message));
        const watchRequest = fetch(url + '/watchSocket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: json["sessionID"], socketID: this.socket.id })
        });
        drawing.JoinWatchingDrawing.onHost(json["sessionID"], [], 0);
    }

    public resolveAction(actionID: number): void {
        assert(this.token !== undefined && this.sessionID !== undefined);
        this.socket?.sendMessage({
            type: GameResponseType.Resolve,
            sessionID: this.sessionID,
            actionID: actionID,
            token: this.token
        })
    }

    private onReceiveAction(sessionID: SessionID, announcement: Announcement): void {
        const action = announcement.action;
        if (sessionID != this.sessionID) return;
        switch (action.type) {
            case ActionType.QuestionOnly: {
                const timeLeft = action.durationSeconds ? action.durationSeconds * 1000 - (announcement.serverTime - action.timeOfAnnouncement) : undefined;
                drawing.OnlyQuestionDrawing.onHost(action.textContent, action.actionID, timeLeft);
                break;
            }
            case ActionType.Question: {
                const timeLeft = action.durationSeconds ? action.durationSeconds * 1000 - (announcement.serverTime - action.timeOfAnnouncement) : undefined;
                drawing.QuestionDrawing.onHost(action.question, action.questionID, action.actionID, timeLeft);
                break;
            }
            case ActionType.Leaderboard: {
                drawing.LeaderboardDrawing.onHost(action.results, action.actionID);
                break;
            }
            case ActionType.Join: {
                drawing.JoinWatchingDrawing.onHost(this.sessionID, action.people, 0);
                break;
            }
            case ActionType.Statistics: {
                drawing.StatisticsDrawing.onHost(action.question, action.answerStatistics, action.questionID, action.actionID);
                break;
            }
        }
    }
}