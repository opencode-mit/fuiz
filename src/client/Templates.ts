import { Question, Leaderboard, SessionID, PlayerID, AnswerChoiceSolved, AnswerChoiceStatistics } from '../types';

const templates = {
    questionHost: (question: Question, questionID: number, actionID?: number, timeLeft?: number) => `
    <div class="question-display desktop">
        <div class="question-text">${question.content}</div>
        <div class="middle">
            ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
            <div class="image" style="background: center / auto 100% no-repeat url('${question.imageURL ?? "https://cdn150.picsart.com/upscale-253923466012212.png"}')"></div>
            ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        </div>
        <div class="answer-choice-container" id="question#${questionID}">
            ${question.answerChoices.map((answer, i) => `
            <button class="answer pushable off">
                <span class="front">${answer.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    questionDesktop: (question: Question, questionID: number, timeLeft?: number) => `
    <div class="question-display desktop">
        <div class="question-text">${question.content}</div>
        <div class="middle">
            ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
            <div class="image" style="background: center / auto 100% no-repeat url('${question.imageURL ?? "https://cdn150.picsart.com/upscale-253923466012212.png"}')"></div>
        </div>
        <div class="answer-choice-container" id="question#${questionID}">
            ${question.answerChoices.map((answer, i) => `
            <button class="answer pushable" id="answer#${i}">
                <span class="front">${answer.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    questionMobile: (question: Question, questionID: number, timeLeft?: number) => `
    <div class="question-display mobile">
        <div class="answer-choice-container" id="question#${questionID}">
            ${question.answerChoices.map((answer, i) => `
            <button class="answer pushable" id="answer#${i}">
                <span class="front"></span>
            </button>`).join("")}
        </div>
    </div>`,
    leaderboardHost: (leaderboard: Leaderboard, final: boolean, actionID?: number) => `
    <div class="leaderboard">
        <div class="title">
            Leaderboard
            ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        </div>
        <div class="record-container ${final ? `final` : ``}">
            ${leaderboard.map((record, i) => `
            <div class="record" id="${record.playerID}">
                <span class="user"><span class="rank">#${i + 1}</span><span class="name">${record.playerID}</span></span>
                <span class="score">${record.score}</span>
            </div>`).join("")}
        </div>
    </div>`,
    leaderboardDesktop: (leaderboard: Leaderboard, final: boolean) => `
    <div class="leaderboard">
        <div class="title">Leaderboard</div>
        <div class="record-container ${final ? `final` : ``}">
            ${leaderboard.map((record, i) => `
            <div class="record" id="${record.playerID}">
                <span class="user"><span class="rank">#${i + 1}</span><span class="name">${record.playerID}</span></span>
                <span class="score">${record.score}</span>
            </div>`).join("")}
        </div>
    </div>`,
    questionOnlyHost: (content: string, actionID?: number, timeLeft?: number) => `
    <div class="question-only-container">
        ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
        ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        <div class="question-text">${content}</div>
    </div>`,
    questionOnlyDesktop: (content: string, timeLeft?: number) => `
    <div class="question-only-container">
        ${timeLeft !== undefined ? `<div class="seconds-timer timer"></div>` : ``}
        <div class="question-text">${content}</div>
    </div>`,
    questionOnlyMobile: (timeLeft?: number) => `
    <div class="question-only-container">
        ${timeLeft !== undefined ? `<div class="main-seconds-timer timer"></div>` : ``}
    </div>`,
    mainScreen: () => `
    <main class="menu">
        <div class="form-container">
            <form id="choose" autocomplete="off">
                <img class="logo" src="media/logo_black.svg" />
                <button class="pushable blue" id="show-host">
                    <span class="front">
                        Host
                    </span>
                </button>
                <button class="pushable blue" id="show-join">
                    <span class="front">
                        Join
                    </span>
                </button>
            </form>
            <form id="register" style="display: none" autocomplete="off">
                <img class="logo" src="media/logo_black.svg" />
                <button type="button" class="go-back">
                    <span class="go-back-icon"></span>
                    Go Back
                </button>
                <div class="input">
                    <textarea id="jsonConfig" name="jsonConfig" placeholder="JSON Config"></textarea>
                </div>
                <div class="error" style="display:none">
                    <span class="error-icon"></span>
                    <span class="error-message"></span>
                </div>
                <button type="submit" class="pushable blue">
                    <span class="front">
                        Host
                    </span>
                </button>
            </form>
            <form id="join" style="display: none" autocomplete="off">
                <div>
                    <img class="logo" src="media/logo_black.svg" />
                    <button type="button" class="go-back">
                        <span class="go-back-icon"></span>
                        Go Back
                    </button>
                </div>
                <div class="input">
                    <input type="text" id="playerID" name="playerID" placeholder="Name">
                    <input type="text" id="sessionID" name="sessionID" placeholder="Game PID">
                </div>
                <div class="error" style="display:none">
                    <span class="error-icon"></span>
                    <span class="error-message"></span>
                </div>
                <button type="submit" class="pushable blue">
                    <span class="front">
                        Join
                    </span>
                </button>
            </form>
        </div>
    </main>`,
    joinWatchingHost: (sessionID: SessionID, players: PlayerID[], actionID?: number) => `
    <main class="join-watching">
        <div class="title">
            ${sessionID}
            ${actionID !== undefined ? `<button id="resolve#${actionID}" class="pushable blue"><div class="front">Start</div></button>` : ``}
        </div>
        <div class="players">
            ${players.map((player) => `<span class="name">${player}</span>`).join("")}
        </div>
    </main>`,
    joinWatchingDesktop: (sessionID: SessionID, players: PlayerID[]) => `
    <main class="join-watching">
        <div class="title">${sessionID}</div>
        <div class="players">
            ${players.map((player) => `<span class="name">${player}</span>`).join("")}
        </div>
    </main>`,
    statisticsHost: (question: Question, answers: Array<AnswerChoiceStatistics>, totalVoted: number, questionID: number, actionID?: number) => `
    <div class="question-display desktop">
        <div class="question-text">${question.content}</div>
        <div class="middle">
            <div class="bar-container">
            ${answers.map((answer) => `
            <div class="bar">
                <div class="base"></div>
                <div class="stem" style="height: max(1em, ${70 * answer.votedCount / Math.max(1, ...answers.map(answerChoice => answerChoice.votedCount))}%)"></div>
                <div class="choice-info">
                    <div class="count">${answer.votedCount}</div>
                    ${answer.answerChoice.correct ? `<div class="correct-checkmark"></div>` : ``}
                </div>
            </div>
            `).join("")}
            </div>
            ${actionID !== undefined ? `<button class="pushable blue" id="resolve#${actionID}"><div class="front">Next</div></button>` : ``}
        </div>
        <div class="answer-choice-container" id="question#${questionID}">
            ${answers.map((answer, i) => `
            <button class="answer off pushable ${answer.answerChoice.correct ? "check" : "cross disabled"}">
                <span class="front">${answer.answerChoice.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    statisticsDesktop: (question: Question, answers: Array<AnswerChoiceStatistics>, totalVoted: number, questionID: number, answerID: number = -1) => `
    <div class="question-display desktop">
        <div class="question-text">${question.content}</div>
        <div class="middle">
            <div class="bar-container">
            ${answers.map((answer) => `
            <div class="bar">
                <div class="base"></div>
                <div class="stem" style="height: max(1em, ${70 * answer.votedCount / Math.max(1, ...answers.map(answerChoice => answerChoice.votedCount))}%)"></div>
                <div class="choice-info">
                    <div class="count">${answer.votedCount}</div>
                    ${answer.answerChoice.correct ? `<div class="correct-checkmark"></div>` : ``}
                </div>
            </div>
            `).join("")}
            </div>
        </div>
        <div class="answer-choice-container" id="question#${questionID}">
            ${answers.map((answer, i) => `
            <button class="answer off pushable ${answer.answerChoice.correct ? "check correct" : (i === answerID ? "cross wrong" : "cross disabled")}">
                <span class="front">${answer.answerChoice.content}</span>
            </button>`).join("")}
        </div>
    </div>`,
    statisticsMobile: (question: Question, answers: Array<AnswerChoiceStatistics>, totalVoted: number, questionID: number, answerID: number = -1) => `
    <div class="question-display mobile">
        <div class="answer-choice-container" id="question#${questionID}">
            ${answers.map((answer, i) => `
            <button class="answer off pushable ${answer.answerChoice.correct ? "check correct" : (i === answerID ? "cross wrong" : "cross disabled")}">
                <span class="front"></span>
            </button>`).join("")}
        </div>
    </div>`,
}

export default templates;