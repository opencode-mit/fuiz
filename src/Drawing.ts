import { Leaderboard, Question } from '.';
import templates from './Templates';

export function showQuestion(question: Question) {
    document.body.innerHTML = templates.question(question);
}

export function showLeaderboard(leaderboard: Leaderboard) {
    document.body.innerHTML = templates.leaderboard(leaderboard);
}