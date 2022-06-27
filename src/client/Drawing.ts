import assert from 'assert';
import { AnswerSolved, Leaderboard, PlayerID, Question, SessionID } from '../types';
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
        if (button.classList.contains("disabled")) return;
        const answerCotnainer = button.closest(".answer-container");
        if (!answerCotnainer) return;
        const answerID = Number.parseInt(button.id.slice(7));
        const questionID = Number.parseInt(answerCotnainer.id.slice(9));
        console.log(`answering ${answerID}!`);
        client.submitAnswer(questionID, answerID);
        console.log(answerCotnainer.querySelectorAll(".answer"));
        answerCotnainer.querySelectorAll(".answer").forEach(oneAnswer => {
            if (oneAnswer.id !== button.id) oneAnswer.classList.add("disabled");
        });
    });
}

export function showQuestionPlayer(question: Question, questionID: number) {
    document.body.innerHTML = templates.questionPlayer(question, questionID);
}

export function showLeaderboardPlayer(leaderboard: Leaderboard, playerID?: PlayerID) {
    document.body.innerHTML = templates.leaderboardPlayer(leaderboard);
    if (playerID) document.querySelector(`#${playerID}`)?.classList.add("own");
}

export function showLeaderboardHost(leaderboard: Leaderboard, actionID?: number) {
    document.body.innerHTML = templates.leaderboardHost(leaderboard, actionID);
}

export function showQuestionOnly(content: string) {
    document.body.innerHTML = templates.questionOnly(content);
}

export function showQuestionMobile(question: Question, questionID: number) {
    document.body.innerHTML = templates.questionMobile(question, questionID);
}

export function showQuestionHost(question: Question, questionID: number, actionID?: number) {
    document.body.innerHTML = templates.questionHost(question, questionID, actionID);
}

export function showMainControls() {
    document.body.innerHTML = templates.mainScreen();
    document.querySelector("#register")?.addEventListener("submit", async function (event) {
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

export function showJoinWaitingPlyaer(sessionID: SessionID, players: PlayerID[]): void {
    document.body.innerHTML = templates.joinWaitingPlayer(sessionID, players);
}

export function showJoinWaitingHost(sessionID: SessionID, players: PlayerID[], actionID?: number): void {
    document.body.innerHTML = templates.joinWaitingHost(sessionID, players, actionID);
}

export function showStatisticsHost(question: Question, answers: Array<{ answer: AnswerSolved, voted: number }>, questionID: number, actionID?: number) {
    document.body.innerHTML = templates.statisticsHost(question, answers, questionID, actionID);
}

export function showStatisticsPlayer(question: Question, answers: Array<{ answer: AnswerSolved, voted: number }>, questionID: number, answerID: number | undefined) {
    document.body.innerHTML = templates.statisticsPlayer(question, answers, questionID, answerID);
}

export function showStatisticsMobile(question: Question, answers: Array<{ answer: AnswerSolved, voted: number }>, questionID: number, answerID: number | undefined) {
    document.body.innerHTML = templates.statisticsMobile(question, answers, questionID, answerID);
}