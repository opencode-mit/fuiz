import { Client } from "./Client";
import * as drawing from "./Drawing";
import { Host } from "./Host";

export const url = "http://localhost:8888";

// drawing.showHostQuestion({
//     content: 'How will you answer for your actions?',
//     answers: [
//         {
//             content: 'You cannot'
//         }, {
//             content: 'The consequences'
//         }, {
//             content: 'Stop running'
//         }, {
//             content: 'I\'m behind you'
//         }
//     ]
// }, 0, 0);

// drawing.showQuestionMobile({
//     content: 'How will you answer for your actions?',
//     answers: [
//         {
//             content: 'You cannot'
//         }, {
//             content: 'The consequences'
//         }, {
//             content: 'Stop running'
//         }, {
//             content: 'I\'m behind you'
//         }
//     ]
// }, 0, 10000);

// drawing.showLeaderboardMobile([
//     {playerID: "minecraft", score: 600},
//     {playerID: "barish", score: 400},
//     {playerID: "hannah", score: 300},
//     {playerID: "adhami", score: 100}
// ], "barish");

// drawing.showQuestionOnlyHost("Am I behind you? (Hint: Yes)", 0);

// drawing.showStatisticsMobile({
//     content: 'How will you answer for your actions?',
//     answers: [
//         {
//             content: 'You cannot'
//         }, {
//             content: 'The consequences'
//         }, {
//             content: 'Stop running'
//         }, {
//             content: 'I\'m behind you'
//         }
//     ]
// }, [
//     {answer: {content: 'You cannot', correct: true}, voted: 0},
//     {answer: {content: 'You cannot', correct: false}, voted: 0},
//     {answer: {content: 'You cannot', correct: false}, voted: 0},
//     {answer: {content: 'You cannot', correct: false}, voted: 0}
// ], 0, 0);

export const host = new Host();
export const client = new Client();

drawing.showMainControls(client, host);
drawing.setUpAnswer(client);
drawing.setUpResolve(host);
