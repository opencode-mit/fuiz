import assert from 'assert';
import { AnswerChoiceSolved, AnswerChoiceStatistics, Leaderboard, PlayerID, Question, SessionID } from '../types';
import { Client } from './Client';
import { Host } from './Host';
import SecondsLeftCountdown from './SecondsLeftCountdown';
import templates from './Templates';
import JSConfetti from 'js-confetti';
import { isJSDocThisTag } from 'typescript';

const counters: Array<SecondsLeftCountdown> = [];
let interval: NodeJS.Timer;

function clearCounters(): void {
    while (counters.length) {
        const counter = counters.pop();
        counter?.clear();
    }
    clearInterval(interval);
}

function setupTimer(timeLeft: number): void {
    const timers = document.querySelectorAll(".timer");
    function updateTimers(secondsLeft: number) {
        timers.forEach(timer => timer.innerHTML = secondsLeft.toString());
    }
    updateTimers(Math.round(timeLeft / 1000));
    const counter = new SecondsLeftCountdown(timeLeft, updateTimers);
    counters.push(counter);
}

export function setUpResolve(host: Host): void {
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

export function setUpAnswer(client: Client): void {
    document.body.addEventListener("click", (event) => {
        if (!event || !event.target) return;
        const element = event.target as HTMLElement;
        const button = element.closest("button");
        if (!button) return;
        if (!button.id.match(/answer\#[0-9]+/)) return;
        if (button.classList.contains("off")) return;
        const answerCotnainer = button.closest(".answer-choice-container");
        if (!answerCotnainer) return;
        const answerID = Number.parseInt(button.id.slice(7));
        const questionID = Number.parseInt(answerCotnainer.id.slice(9));
        console.log(`answering ${answerID}!`);
        client.submitAnswer(questionID, answerID);
        console.log(answerCotnainer.querySelectorAll(".answer"));
        answerCotnainer.querySelectorAll(".answer").forEach(oneAnswer => {
            if (oneAnswer.id !== button.id) oneAnswer.classList.add("disabled");
        });
        answerCotnainer.querySelectorAll(".answer").forEach(oneAnswer => {
            oneAnswer.classList.add("off");
        });
    });
}

function clearError() {
    document.querySelectorAll(".error").forEach((element) => {
        const div = element as HTMLDivElement;
        div.style.display = "none";
        const span = div.querySelector(".error-message");
        if (span) {
            span.innerHTML = "";
        }
    });
}

export function showError(message: string) {
    document.querySelectorAll(".error").forEach((element) => {
        const div = element as HTMLDivElement;
        div.style.display = "flex";
        const span = div.querySelector(".error-message");
        if (span) {
            span.innerHTML = message;
        }
    });
}

export function showMainControls(client: Client, host: Host) {
    clearCounters();
    document.body.innerHTML = templates.mainScreen();
    document.querySelector("#register")?.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearError();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const jsonConfig = formData.get("jsonConfig")?.toString();
        if (jsonConfig === undefined) {
            showError("Config cannot be empty");
            return;
        }
        try {
            const gameConfig = JSON.parse(jsonConfig);
            await host.startGame(gameConfig);
        } catch (error) {
            showError("Cannot parse config");
            return;
        }
    });
    document.querySelector("#join")?.addEventListener("submit", (event) => {
        event.preventDefault();
        clearError();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const playerID = formData.get("playerID")?.toString();
        const sessionID = formData.get("sessionID")?.toString();
        if (playerID === undefined) {
            showError("Name cannot be empty");
            return;
        }
        if (sessionID === undefined) {
            showError("Game PID cannot be empty");
            return;
        }
        client.registerGame(playerID, sessionID);
    });
    document.querySelector("#show-host")?.addEventListener("click", (event) => {
        event.preventDefault();
        clearError();
        const registerForm = document.querySelector("#register") as HTMLFormElement;
        const joinForm = document.querySelector("#join") as HTMLFormElement;
        const chooseForm = document.querySelector("#choose") as HTMLFormElement;
        registerForm.style.display = "block";
        joinForm.style.display = "none";
        chooseForm.style.display = "none";
    });
    document.querySelector("#show-join")?.addEventListener("click", (event) => {
        event.preventDefault();
        clearError();
        const registerForm = document.querySelector("#register") as HTMLFormElement;
        const joinForm = document.querySelector("#join") as HTMLFormElement;
        const chooseForm = document.querySelector("#choose") as HTMLFormElement;
        registerForm.style.display = "none";
        joinForm.style.display = "block";
        chooseForm.style.display = "none";
    });
    document.querySelectorAll(".go-back").forEach(goBack => {
        goBack.addEventListener("click", (event) => {
            event.preventDefault();
            clearError();
            const registerForm = document.querySelector("#register") as HTMLFormElement;
            const joinForm = document.querySelector("#join") as HTMLFormElement;
            const chooseForm = document.querySelector("#choose") as HTMLFormElement;
            registerForm.style.display = "none";
            joinForm.style.display = "none";
            chooseForm.style.display = "block";
        });
    });
}

export class StatisticsDrawing {
    public static onHost(question: Question, answers: Array<AnswerChoiceStatistics>, totalVoted: number, questionID: number, actionID?: number): void {
        clearCounters();
        document.body.innerHTML = templates.statisticsHost(question, answers, totalVoted, questionID, actionID);
    }

    public static onDesktop(question: Question, answers: Array<AnswerChoiceStatistics>, totalVoted: number, questionID: number, answerID: number | undefined): void {
        clearCounters();
        document.body.innerHTML = templates.statisticsDesktop(question, answers, totalVoted, questionID, answerID);
    }

    public static onMobile(question: Question, answers: Array<AnswerChoiceStatistics>, totalVoted: number, questionID: number, answerID: number | undefined): void {
        clearCounters();
        document.body.innerHTML = templates.statisticsMobile(question, answers, totalVoted, questionID, answerID);
    }
}

export class LeaderboardDrawing {
    public static onHost(leaderboard: Leaderboard, final: boolean, actionID?: number): void {
        clearCounters();
        document.body.innerHTML = templates.leaderboardHost(leaderboard, final, actionID);
        if (final) {
            const jsConfetti = new JSConfetti();
            setTimeout(() => {
                let cn = 500;
                interval = setInterval(() => {
                    jsConfetti.addConfetti({
                        confettiNumber: cn
                    });
                    cn -= 70;
                    if (cn <= 0) {
                        clearInterval(interval);
                    }
                }, 1000);
            }, 3000 * Math.min(3, leaderboard.length));
        }
    }

    public static onDesktop(leaderboard: Leaderboard, final: boolean, playerID?: PlayerID): void {
        clearCounters();
        document.body.innerHTML = templates.leaderboardDesktop(leaderboard, final);
        if (playerID) document.querySelector(`#${playerID}`)?.classList.add("own");
    }

    public static onMobile(leaderboard: Leaderboard, final: boolean, playerID?: PlayerID): void {
        clearCounters();
        document.body.innerHTML = templates.leaderboardDesktop(leaderboard, final);
        if (playerID) document.querySelector(`#${playerID}`)?.classList.add("own");
    }
}

export class OnlyQuestionDrawing {
    public static onHost(content: string, actionID?: number, timeLeft?: number): void {
        clearCounters();
        document.body.innerHTML = templates.questionOnlyHost(content, actionID, timeLeft);
        if (timeLeft !== undefined) setupTimer(timeLeft);
    }

    public static onDesktop(content: string, timeLeft?: number): void {
        clearCounters();
        document.body.innerHTML = templates.questionOnlyDesktop(content, timeLeft);
        if (timeLeft !== undefined) setupTimer(timeLeft);
    }

    public static onMobile(timeLeft?: number): void {
        clearCounters();
        document.body.innerHTML = templates.questionOnlyMobile(timeLeft);
        if (timeLeft !== undefined) setupTimer(timeLeft);
    }
}

export class QuestionDrawing {
    public static onHost(question: Question, questionID: number, actionID?: number, timeLeft?: number): void {
        clearCounters();
        document.body.innerHTML = templates.questionHost(question, questionID, actionID, timeLeft);
        if (timeLeft !== undefined) setupTimer(timeLeft);
    }

    public static onDesktop(question: Question, questionID: number, timeLeft?: number): void {
        clearCounters();
        document.body.innerHTML = templates.questionDesktop(question, questionID, timeLeft);
        if (timeLeft !== undefined) setupTimer(timeLeft);
    }

    public static onMobile(question: Question, questionID: number, timeLeft?: number): void {
        clearCounters();
        document.body.innerHTML = templates.questionMobile(question, questionID, timeLeft);
        if (timeLeft !== undefined) setupTimer(timeLeft);
    }
}

export class JoinWatchingDrawing {
    public static onHost(sessionID: SessionID, players: PlayerID[], actionID?: number): void {
        clearCounters();
        document.body.innerHTML = templates.joinWatchingHost(sessionID, players, actionID);
    }

    public static onDesktop(sessionID: SessionID, players: PlayerID[]): void {
        clearCounters();
        document.body.innerHTML = templates.joinWatchingDesktop(sessionID, players);
    }

    public static onMobile(sessionID: SessionID, players: PlayerID[]): void {
        clearCounters();
        document.body.innerHTML = templates.joinWatchingDesktop(sessionID, players);
    }
}