import assert from 'assert';
import { Leaderboard, PlayerID, Question, SessionID } from '../types';
import { Client } from './Client';
import { client, host } from './FuizClient';
import { Host } from './Host';
import templates from './Templates';

export function setUpResolve(host: Host) {
    document.body.addEventListener("click", (event) => {
        if (!event || !event.target) return;
        const element = event.target as HTMLElement;
        const button = element.closest("button");
        if (!button) return;
        if (!button.id.match(/resolve\#[0-9]+/)) return;
        const actionID = Number.parseInt(button.id.slice(8));
        console.log(`resolving ${actionID}!`);
        host.resolveAction(actionID);
    });
}

export function setUpAnswer(client: Client) {
    document.body.addEventListener("click", (event) => {
        if (!event || !event.target) return;
        const element = event.target as HTMLElement;
        const button = element.closest("button");
        if (!button) return;
        if (!button.id.match(/answer\#[0-9]+/)) return;
        console.log(`answering!`);
        const answerCotnainer = button.closest(".answer-container");
        if (!answerCotnainer) return;
        const answerID = Number.parseInt(button.id.slice(7));
        const questionID = Number.parseInt(answerCotnainer.id.slice(9));
        console.log(`answering ${answerID}!`);
        client.submitAnswer(questionID, answerID);
    });
}

export function showQuestion(question: Question, questionID: number) {
    document.body.innerHTML = templates.question(question, questionID);
}

export function showLeaderboard(leaderboard: Leaderboard) {
    document.body.innerHTML = templates.leaderboard(leaderboard);
}

export function showHostLeaderboard(leaderboard: Leaderboard, actionID: number) {
    document.body.innerHTML = templates.hostLeaderboard(leaderboard, actionID);
}

export function showQuestionOnly(content: string) {
    document.body.innerHTML = templates.questionOnly(content);
}

export function showPlayersQuestion(question: Question, questionID: number) {
    document.body.innerHTML = templates.playersQuestion(question, questionID);
}

export function showHostQuestion(question: Question, actionID: number, questionID: number) {
    document.body.innerHTML = templates.hostQuestion(question, actionID, questionID);
}

export function showMainControls() {
    document.body.innerHTML = templates.joinMake();
    document.querySelector("#register")?.addEventListener("submit", async function(event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const jsonConfig = formData.get("jsonConfig")?.toString();
        assert(jsonConfig);
        const gameConfig = JSON.parse(jsonConfig);
        await host.startGame(gameConfig);
    });
    document.querySelector("#join")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const playerID = formData.get("playerID")?.toString();
        const sessionID = formData.get("sessionID")?.toString();
        assert(playerID && sessionID);
        client.registerGame(playerID, sessionID);
    });
}

export function showStartingScreen(sessionID: SessionID, players: PlayerID[]): void {
    document.body.innerHTML = templates.startingScreen(sessionID, players);
}

export function showHostStartingScreen(sessionID: SessionID, players: PlayerID[], actionID: number): void {
    document.body.innerHTML = templates.hostStartingScreen(sessionID, players, actionID);
}