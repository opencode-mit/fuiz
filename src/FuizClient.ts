import { showQuestion } from "./Drawing";

showQuestion({
    content: 'How will you answer for your actions?',
    answers: [
        {
            content: 'You cannot'
        }, {
            content: 'The consequences'
        }, {
            content: 'Stop running'
        }, {
            content: 'I\'m behind you'
        }
    ]
});