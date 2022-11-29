import { Action, ActionType, Announcement, GameResponseType, Hash, PlayerID, PlayingMode, Question, SessionID } from "../types";
import { makeConnectedSocket, ClientSocket } from "./ClientSocket";
import * as drawing from "./Drawing";

export class Client {
    private playerID: PlayerID | undefined;
    private sessionID: SessionID | undefined;
    private token: Hash | undefined;
    private socket: ClientSocket | undefined;
    private answers = new Map<number, number>();

    public constructor() { }

    public async registerGame(playerID: PlayerID, sessionID: SessionID) {
        if (playerID.trim() === '') {
            drawing.showError("Name cannot be empty");
            return;
        }
        if (sessionID.trim() === '') {
            drawing.showError("Game PID cannot be empty");
            return;
        }
        this.answers = new Map();
        this.socket = await makeConnectedSocket(sessionID, (sessionID, message) => this.onReceiveAction(sessionID, message));
        console.log({ socketID: this.socket.id, sessionID: sessionID, playerID: playerID });
        const request = fetch('/registerPlayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ socketID: this.socket.id, sessionID: sessionID.toUpperCase(), playerID: playerID })
        });
        const response = await request;
        if (response.status !== 200 && response.status !== 202) {
            drawing.showError(await response.text());
            return;
        }
        const json = await response.json();
        this.sessionID = sessionID;
        this.token = json["token"];
        this.playerID = playerID;
        this.onReceiveAction(sessionID, json["announcement"]);
    }

    private onReceiveAction(sessionID: SessionID, announcement: Announcement): void {
        const action = announcement.action;
        if (sessionID !== this.sessionID) return;
        if (this.playerID === undefined) return;
        if (action.mode === PlayingMode.Desktop) {
            switch (action.type) {
                case ActionType.QuestionOnly: {
                    const timeLeft = action.durationSeconds ? action.durationSeconds * 1000 - (announcement.serverTime - action.timeOfAnnouncement) : undefined;
                    drawing.OnlyQuestionDrawing.onDesktop(action.textContent, timeLeft);
                    break;
                }
                case ActionType.Question: {
                    const timeLeft = action.durationSeconds ? action.durationSeconds * 1000 - (announcement.serverTime - action.timeOfAnnouncement) : undefined;
                    drawing.QuestionDrawing.onDesktop(action.question, action.questionID, timeLeft);
                    break;
                }
                case ActionType.Leaderboard: {
                    drawing.LeaderboardDrawing.onDesktop(action.results, action.final, this.playerID);
                    break;
                }
                case ActionType.Join: {
                    drawing.JoinWatchingDrawing.onDesktop(this.sessionID, [...new Set([...action.people, this.playerID])]);
                    break;
                }
                case ActionType.Statistics: {
                    drawing.StatisticsDrawing.onDesktop(action.question, action.answerStatistics, action.totalVoted, action.questionID, this.answers.get(action.questionID));
                    break;
                }
            }
        } else {
            switch (action.type) {
                case ActionType.QuestionOnly: {
                    const timeLeft = action.durationSeconds ? action.durationSeconds * 1000 - (announcement.serverTime - action.timeOfAnnouncement) : undefined;
                    drawing.OnlyQuestionDrawing.onMobile(timeLeft);
                    break;
                }
                case ActionType.Question: {
                    const timeLeft = action.durationSeconds ? action.durationSeconds * 1000 - (announcement.serverTime - action.timeOfAnnouncement) : undefined;
                    drawing.QuestionDrawing.onMobile(action.question, action.questionID, timeLeft);
                    break;
                }
                case ActionType.Leaderboard: {
                    drawing.LeaderboardDrawing.onMobile(action.results, action.final, this.playerID);
                    break;
                }
                case ActionType.Join: {
                    drawing.JoinWatchingDrawing.onMobile(this.sessionID, [...new Set([...action.people, this.playerID])]);
                    break;
                }
                case ActionType.Statistics: {
                    drawing.StatisticsDrawing.onMobile(action.question, action.answerStatistics, action.totalVoted, action.questionID, this.answers.get(action.questionID));
                    break;
                }
            }
        }
    }

    public submitAnswer(questionID: number, answerID: number): void {
        if (this.sessionID && this.playerID && this.token) {
            this.answers.set(questionID, answerID);
            this.socket?.sendMessage({
                type: GameResponseType.Answer,
                sessionID: this.sessionID,
                playerID: this.playerID,
                playerToken: this.token,
                questionID: questionID,
                answerID: answerID
            });
        }
    }
}