import assert from 'assert';
import { AnswerSolved, Leaderboard, PlayerID, Question, SessionID } from '../types';
import { Client } from './Client';
import { Host } from './Host';
import SecondsLeftCountdown from './SecondsLeftCountdown';
import templates from './Templates';

const counters: Array<SecondsLeftCountdown> = [];

function clearCounters() {
    while (counters.length) {
        const counter = counters.pop();
        counter?.clear();
    }
}

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

export function showLeaderboardPlayer(leaderboard: Leaderboard, playerID?: PlayerID) {
    clearCounters();
    document.body.innerHTML = templates.leaderboardPlayer(leaderboard);
    if (playerID) document.querySelector(`#${playerID}`)?.classList.add("own");
}

export function showLeaderboardHost(leaderboard: Leaderboard, actionID?: number) {
    clearCounters();
    document.body.innerHTML = templates.leaderboardHost(leaderboard, actionID);
}

export function showQuestionOnlyHost(content: string, actionID?: number, timeLeft?: number) {
    clearCounters();
    document.body.innerHTML = templates.questionOnlyHost(content, actionID);
    if (timeLeft !== undefined) {
        const countdown = new SecondsLeftCountdown(timeLeft, (timeLeft) => console.log(timeLeft));
        counters.push(countdown);
    }
}

export function showQuestionOnlyPlayer(content: string, timeLeft?: number) {
    clearCounters();
    document.body.innerHTML = templates.questionOnlyPlayer(content);
    if (timeLeft !== undefined) {
        const countdown = new SecondsLeftCountdown(timeLeft, (timeLeft) => console.log(timeLeft));
        counters.push(countdown);
    }
}

export function showQuestionPlayer(question: Question, questionID: number, timeLeft?: number) {
    clearCounters();
    document.body.innerHTML = templates.questionPlayer(question, questionID);
    if (timeLeft !== undefined) {
        const countdown = new SecondsLeftCountdown(timeLeft, (timeLeft) => console.log(timeLeft));
        counters.push(countdown);
    }
}

export function showQuestionMobile(question: Question, questionID: number, timeLeft?: number) {
    clearCounters();
    document.body.innerHTML = templates.questionMobile(question, questionID);
    if (timeLeft !== undefined) {
        const countdown = new SecondsLeftCountdown(timeLeft, (timeLeft) => console.log(timeLeft));
        counters.push(countdown);
    }
}

export function showQuestionHost(question: Question, questionID: number, actionID?: number, timeLeft?: number) {
    clearCounters();
    document.body.innerHTML = templates.questionHost(question, questionID, actionID);
    if (timeLeft !== undefined) {
        const countdown = new SecondsLeftCountdown(timeLeft, (timeLeft) => console.log(timeLeft));
        counters.push(countdown);
    }
}

export function showMainControls(client: Client, host: Host) {
    clearCounters();
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
    clearCounters();
    document.body.innerHTML = templates.joinWaitingPlayer(sessionID, players);
}

export function showJoinWaitingHost(sessionID: SessionID, players: PlayerID[], actionID?: number): void {
    clearCounters();
    document.body.innerHTML = templates.joinWaitingHost(sessionID, players, actionID);
}

export function showStatisticsHost(question: Question, answers: Array<{ answer: AnswerSolved, voted: number }>, questionID: number, actionID?: number) {
    clearCounters();
    document.body.innerHTML = templates.statisticsHost(question, answers, questionID, actionID);
}

export function showStatisticsPlayer(question: Question, answers: Array<{ answer: AnswerSolved, voted: number }>, questionID: number, answerID: number | undefined) {
    clearCounters();
    document.body.innerHTML = templates.statisticsPlayer(question, answers, questionID, answerID);
}

export function showStatisticsMobile(question: Question, answers: Array<{ answer: AnswerSolved, voted: number }>, questionID: number, answerID: number | undefined) {
    clearCounters();
    document.body.innerHTML = templates.statisticsMobile(question, answers, questionID, answerID);
}