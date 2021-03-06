import { Question, Leaderboard, SessionID, PlayerID, AnswerChoiceSolved, AnswerChoiceStatistics } from '../types';

const templates = {
    questionHost: (question: Question, questionID: number, actionID?: number, timeLeft?: number) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="gap">
            ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
            <div class="image" style="background: center / auto 100% no-repeat url('${question.imageURL ?? "https://cdn150.picsart.com/upscale-253923466012212.png"}')"></div>
            ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        </div>
        <div class="answer-container" id="question#${questionID}">
            ${question.answerChoices.map((answer, i) => `
            <button class="answer pushable">
                <span class="front">${answer.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    questionDesktop: (question: Question, questionID: number, timeLeft?: number) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="gap">
            ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
            <div class="image" style="background: center / auto 100% no-repeat url('${question.imageURL ?? "https://cdn150.picsart.com/upscale-253923466012212.png"}')"></div>
        </div>
        <div class="answer-container" id="question#${questionID}">
            ${question.answerChoices.map((answer, i) => `
            <button class="answer pushable" id="answer#${i}">
                <span class="front">${answer.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    questionMobile: (question: Question, questionID: number, timeLeft?: number) => `
    <div class="players-question-container">
        <div class="answer-container" id="question#${questionID}">
            ${question.answerChoices.map((answer, i) => `
            <button class="answer pushable" id="answer#${i}">
                <span class="front"></span>
            </button>`).join("")}
        </div>
    </div>`,
    leaderboardHost: (leaderboard: Leaderboard, actionID?: number) => `
    <div class="leaderboard">
        <div class="title">
            Leaderboard
            ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        </div>
        <div class="record-container">
            ${leaderboard.map((record, i) => `
            <div class="record" id="${record.playerID}">
                <span class="user"><span class="rank">${i + 1}</span>${record.playerID}</span>
                <span class="score">${record.score}</span>
            </div>`).join("")}
        </div>
    </div>`,
    leaderboardDesktop: (leaderboard: Leaderboard) => `
    <div class="leaderboard">
        <div class="title">Leaderboard</div>
        <div class="record-container">
            ${leaderboard.map((record, i) => `
            <div class="record" id="${record.playerID}">
                <span class="user"><span class="rank">${i + 1}</span>${record.playerID}</span>
                <span class="score">${record.score}</span>
            </div>`).join("")}
        </div>
    </div>`,
    questionOnlyHost: (content: string, actionID?: number, timeLeft?: number) => `
    <div class="questiononly-container">
        ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
        ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        <div class="question">${content}</div>
    </div>`,
    questionOnlyDesktop: (content: string, timeLeft?: number) => `
    <div class="questiononly-container">
        ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
        <div class="question">${content}</div>
    </div>`,
    questionOnlyMobile: (timeLeft?: number) => `
    <div class="questiononly-container">
        ${timeLeft !== undefined ? `<div class="main-seconds-timer timer"></div>` : ``}
    </div>`,
    mainScreen: () => `
    <main class="menu">
        <div class="form-container">
            <form id="register">
                <div class="input">
                    <label for="jsonConfig">JSON Config</label>
                    <textarea id="jsonConfig" name="jsonConfig"></textarea>
                </div>
                <button class="pushable blue">
                    <span class="front">
                        Start
                    </span>
                </button>
            </form>
            <form id="join">
                <div class="input">
                    <label for="playerID">Name</label>
                    <input type="text" id="playerID" name="playerID">
                    <label for="sessionID">Session ID</label>
                    <input type="text" id="sessionID" name="sessionID">
                </div>
                <button class="pushable blue">
                    <span class="front">
                        Join
                    </span>
                </button>
            </form>
        <div>
    </main>`,
    joinWaitingHost: (sessionID: SessionID, players: PlayerID[], actionID?: number) => `
    <main class="starting">
        <div class="title">
            ${sessionID}
            ${actionID !== undefined ? `<button id="resolve#${actionID}" class="pushable blue"><div class="front">Start</div></button>` : ``}
        </div>
        <div class="players">
            ${players.map((player) => `<span class="name">${player}</span>`).join("")}
        </div>
    </main>`,
    joinWaitingDesktop: (sessionID: SessionID, players: PlayerID[]) => `
    <main class="starting">
        <div class="title">${sessionID}</div>
        <div class="players">
            ${players.map((player) => `<span class="name">${player}</span>`).join("")}
        </div>
    </main>`,
    statisticsHost: (question: Question, answers: Array<AnswerChoiceStatistics>, questionID: number, actionID?: number) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="gap">
            <div class="image" style="background: center / auto 100% no-repeat url('${question.imageURL ?? "https://cdn150.picsart.com/upscale-253923466012212.png"}')"></div>
            ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        </div>
        <div class="answer-container" id="question#${questionID}">
            ${answers.map((answer, i) => `
            <button class="answer pushable ${answer.answerChoice.correct ? "check" : "cross disabled"}">
                <span class="front">${answer.answerChoice.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    statisticsDesktop: (question: Question, answers: Array<AnswerChoiceStatistics>, questionID: number, answerID: number = -1) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="gap">
            <div class="image" style="background: center / auto 100% no-repeat url('${question.imageURL ?? "https://cdn150.picsart.com/upscale-253923466012212.png"}')"></div>
        </div>
        <div class="answer-container" id="question#${questionID}">
            ${answers.map((answer, i) => `
            <button class="answer pushable ${answer.answerChoice.correct ? "check correct" : (i === answerID ? "cross wrong" : "cross disabled")}">
                <span class="front">${answer.answerChoice.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    statisticsMobile: (question: Question, answers: Array<AnswerChoiceStatistics>, questionID: number, answerID: number = -1) => `
    <div class="players-question-container">
        <div class="answer-container" id="question#${questionID}">
            ${answers.map((answer, i) => `
            <button class="answer pushable ${answer.answerChoice.correct ? "check correct" : (i === answerID ? "cross wrong" : "cross disabled")}">
                <span class="front"></span>
            </button>`).join("")}
        </div>
    </div>`,
}

export default templates;