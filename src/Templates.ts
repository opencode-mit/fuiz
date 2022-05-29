import { Question, Leaderboard } from '.';

const templates = {
    question: (question: Question) => `
    <div class="question-container">
        <div class="question">${question.content}</div>
        <div class="answer-container">
            ${question.answers.map(answer => `<button class="answer">${answer.content}</button>`).join("")}
        </div>
    </div>`,
    leaderboard: (leaderboard: Leaderboard) => `
    <div class="leaderboard">
        ${leaderboard.map(record => `
        <div class="record">
            <span class="user">${record.playerID}</span>
            <span class="score">${record.score}</span>
        </div>`).join("")}
    </div>
    `
}

export default templates;