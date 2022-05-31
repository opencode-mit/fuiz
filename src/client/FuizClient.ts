import { showLeaderboard, showQuestion, showQuestionOnly, showPlayersQuestion, setUpResolve, showHostQuestion } from "./Drawing";
import { Host } from "./Host";

export const url = "http://localhost:8888";

// showQuestion({
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
// });

// showLeaderboard([
//     {playerID: "minecraft", score: 600},
//     {playerID: "barish", score: 400},
//     {playerID: "hannah", score: 300},
//     {playerID: "adhami", score: 100}
// ]);

// showQuestionOnly("Am I behind you? (Hint: Yes)");

async function sampleSetup() {
    const host = new Host();
    
    const json = await host.startGame({
        gamemode: 'quiz',
        delay: 10000,
        questions: [
            {
                content: "2+2=",
                answers: [
                    {
                        content: "4",
                        correct: true
                    }, {
                        content: "2",
                        correct: false
                    }, {
                        content: "6",
                        correct: false
                    }, {
                        content: "8",
                        correct: false
                    }
                ]
            }, {
                content: "What is the capital of Jordan?",
                answers: [
                    {
                        content: "Amman",
                        correct: true
                    }, {
                        content: "Brazil",
                        correct: false
                    }, {
                        content: "The Unites States of America",
                        correct: false
                    }, {
                        content: "Irbid",
                        correct: false
                    }
                ]
            }
        ]
    });
    
    setUpResolve(host);
    
    await host.resolveAction(0);
    
    showHostQuestion({
        content: "2+2=",
        answers: [
            {
                content: "4"
            }, {
                content: "2"
            }, {
                content: "6"
            }, {
                content: "8"
            }
        ]
    }, 1);
}


sampleSetup();