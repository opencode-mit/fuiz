import { Leaderboard, Question } from '../types';
import templates from './Templates';

export function showQuestion(question: Question) {
    document.body.innerHTML = templates.question(question);
}

export function showLeaderboard(leaderboard: Leaderboard) {
    document.body.innerHTML = templates.leaderboard(leaderboard);
}

export function showQuestionOnly(content: string) {
    document.body.innerHTML = templates.questionOnly(content);
}

export function showPlayersQuestion(question: Question) {
    document.body.innerHTML = templates.playersQuestion(question);
}