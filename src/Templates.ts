import { Question, Leaderboard } from '.';

const templates = {
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
    </div>
    `,
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
}

export default templates;