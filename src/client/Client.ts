import { Action, Announcement, Hash, PlayerID, Question, SessionID } from "../types";
import { makeConnectedSocket, ClientSocket } from "./ClientSocket";
import { url } from "./FuizClient";
import * as drawing from "./Drawing";

export class Client {
    private playerID: PlayerID | undefined;
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;
    private socket: ClientSocket | undefined;
    private answers = new Map<number, number>();

    public constructor() { }

    public async registerGame(playerID: PlayerID, sessionID: SessionID) {
        this.answers = new Map();
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
        this.playerID = playerID;
        drawing.showJoinWaitingPlyaer(sessionID, [playerID]);
    }

    private onReciveAction(sessionID: SessionID, announcement: Announcement): void {
        const action = announcement.action;
        if (sessionID !== this.sessionID) return;
        if (action.mode === 'player') {
            if (action.type === 'question_only') {
                const timeLeft = action.duration ? action.duration - (announcement.serverTime - action.time) : undefined;
                drawing.showQuestionOnlyPlayer(action.content, timeLeft);
            } else if (action.type === 'question') {
                const timeLeft = action.duration ? action.duration - (announcement.serverTime - action.time) : undefined;
                drawing.showQuestionPlayer(action.question, action.questionID, timeLeft);
            } else if (action.type === 'leaderboard') {
                drawing.showLeaderboardPlayer(action.results, this.playerID);
            } else if (action.type === 'join') {
                drawing.showJoinWaitingPlyaer(this.sessionID, action.people);
            } else if (action.type === 'statistics') {
                drawing.showStatisticsPlayer(action.question, action.answers, action.questionID, this.answers.get(action.questionID));
            }
        } else {
            if (action.type === 'question_only') {
                const timeLeft = action.duration ? action.duration - (announcement.serverTime - action.time) : undefined;
                drawing.showQuestionOnlyMobile(timeLeft);
            } else if (action.type === 'question') {
                const timeLeft = action.duration ? action.duration - (announcement.serverTime - action.time) : undefined;
                drawing.showQuestionMobile(action.question, action.questionID, timeLeft);
            } else if (action.type === 'leaderboard') {
                drawing.showLeaderboardMobile(action.results, this.playerID);
            } else if (action.type === 'join') {
                drawing.showJoinWaitingMobile(this.sessionID, action.people);
            } else if (action.type === 'statistics') {
                drawing.showStatisticsMobile(action.question, action.answers, action.questionID, this.answers.get(action.questionID));
            }
        }
    }

    public submitAnswer(questionID: number, answerID: number): void {
        if (this.sessionID && this.playerID && this.token) {
            this.answers.set(questionID, answerID);
            this.socket?.sendMessage({
                type: 'answer',
                sessionID: this.sessionID,
                playerID: this.playerID,
                playerToken: this.token,
                questionID: questionID,
                answerID: answerID
            });
        }
    }
}