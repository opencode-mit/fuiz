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

// drawing.showHostLeaderboard([
//     {playerID: "minecraft", score: 600},
//     {playerID: "barish", score: 400},
//     {playerID: "hannah", score: 300},
//     {playerID: "adhami", score: 100}
// ], 0);

// showQuestionOnly("Am I behind you? (Hint: Yes)");

export const host = new Host();
export const client = new Client();

drawing.showMainControls();
drawing.setUpResolve(host);
drawing.setUpAnswer(client);
