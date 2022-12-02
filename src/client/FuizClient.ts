import { Client } from "./Client";
import * as drawing from "./Drawing";
import { Host } from "./Host";

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

// drawing.LeaderboardDrawing.onHost([
//     {playerID: "minecraft", score: 600},
//     {playerID: "barish", score: 400},
//     {playerID: "hannah", score: 300},
//     {playerID: "adhami", score: 100},
//     {playerID: "mahmoud", score: 100},
//     {playerID: "msobier", score: 100},
//     {playerID: "henri", score: 100},
//     {playerID: "yaseen", score: 100},
//     {playerID: "abutalib", score: 100},
//     {playerID: "khaleel", score: 100},
//     {playerID: "namazov", score: 100},
//     {playerID: "minecraft", score: 600},
//     {playerID: "barish", score: 400},
//     {playerID: "hannah", score: 300},
//     {playerID: "adhami", score: 100},
//     {playerID: "mahmoud", score: 100},
//     {playerID: "msobier", score: 100},
//     {playerID: "henri", score: 100},
//     {playerID: "yaseen", score: 100},
//     {playerID: "abutalib", score: 100},
//     {playerID: "khaleel", score: 100},
//     {playerID: "namazov", score: 100},
// ], true);

// drawing.showQuestionOnlyHost("Am I behind you? (Hint: Yes)", 0);

// drawing.StatisticsDrawing.onHost({
//     content: 'How will you answer for your actions?',
//     answerChoices: [
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
//     {answerChoice: {content: 'You cannot', correct: true}, votedCount: 1},
//     {answerChoice: {content: 'You cannot', correct: false}, votedCount: 4},
//     {answerChoice: {content: 'You cannot', correct: true}, votedCount: 3},
//     {answerChoice: {content: 'You cannot', correct: false}, votedCount: 0}
// ], 8, 0, 0);

export const host = new Host();
export const client = new Client();

drawing.showMainControls(client, host);
drawing.setUpAnswer(client);
drawing.setUpResolve(host);
