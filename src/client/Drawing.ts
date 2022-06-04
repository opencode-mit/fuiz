import assert from 'assert';
import { Leaderboard, Question } from '../types';
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

export function showQuestion(question: Question) {
    document.body.innerHTML = templates.question(question);
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

export function showPlayersQuestion(question: Question) {
    document.body.innerHTML = templates.playersQuestion(question);
}

export function showHostQuestion(question: Question, actionID: number) {
    document.body.innerHTML = templates.hostQuestion(question, actionID);
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
        host.resolveAction(0);
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