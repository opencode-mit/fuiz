import { Question, Leaderboard } from '../types';

const templates = {
    hostQuestion: (question: Question, actionID: number) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="gap"><button id="resolve#${actionID}">Next</button></div>
        <div class="answer-container">
            ${question.answers.map(answer => `
            <button class="answer pushable">
                <span class="front">${answer.content}</span>
            </button>`
            ).join("")}
        </div>
    </div>`,
    question: (question: Question) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="gap"></div>
        <div class="answer-container">
            ${question.answers.map(answer => `
            <button class="answer pushable">
                <span class="front">${answer.content}</span>
            </button>`
            ).join("")}
        </div>
    </div>`,
    leaderboard: (leaderboard: Leaderboard) => `
    <div class="leaderboard">
        <div class="title">Leaderboard</div>
        <div class="record-container">
            ${leaderboard.map((record, i) => `
            <div class="record">
                <span class="user"><span class="rank">${i+1}</span>${record.playerID}</span>
                <span class="score">${record.score}</span>
            </div>`).join("")}
        </div>
    </div>`,
    hostLeaderboard: (leaderboard: Leaderboard, actionID: number) => `
    <div class="leaderboard">
        <div class="title">Leaderboard</div>
        <div class="record-container">
            ${leaderboard.map((record, i) => `
            <div class="record">
                <span class="user"><span class="rank">${i+1}</span>${record.playerID}</span>
                <span class="score">${record.score}</span>
            </div>`).join("")}
        </div>
        <button id="resolve#${actionID}">Next</button>
    </div>`,
    questionOnly: (content: string) => `
    <div class="questiononly-container">
        <div class="question">${content}</div>
    </div>`,
    playersQuestion: (question: Question) => `
    <div class="players-question-container">
        <div class="answer-container">
            ${question.answers.map(answer => `
            <button class="answer pushable">
                <span class="front"></span>
            </button>`
            ).join("")}
        </div>
    </div>`,
    joinMake: () => `
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
    </main>`
}

export default templates;