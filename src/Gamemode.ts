import { GameConfig, Action } from ".";
import { PlayerID } from ".";

type Answer = {
    playerID: PlayerID,
    answerID: number,
    timeSubmitted: number
}

export interface Gamemode {

    submitAnswer(questionID: number, playerID: PlayerID, answerID: number): void;

    resolveAction(actionID: number): void;
}

class Quiz implements Gamemode {

    private readonly toBeResolved: Array<{ resolved: boolean, callback: () => void }> = [];
    private readonly answers: Array<Array<Answer>> = [];
    private currentQuestion = -1;
    private acceptingResponses = false;

    public constructor(
        private readonly config: GameConfig,
        private readonly announceCallback: (action: Action) => void
    ) {
        this.toBeResolved.push({ resolved: false, callback: this.startGame })
    }

    public submitAnswer(questionID: number, playerID: string, answerID: number): void {
        const questionAnswers = this.answers[questionID];
        if (this.acceptingResponses && questionAnswers !== undefined && this.currentQuestion === questionID) {
            questionAnswers.push({ playerID: playerID, answerID: answerID, timeSubmitted: Date.now() });
        } else {
            // do something D:
        }
    }

    private startGame() {
        this.announceNextQuestion();
    }

    private announceNextQuestion() {
        this.currentQuestion++;
        const question = this.config.questions[this.currentQuestion];
        if (question === undefined) return;
        this.toBeResolved.push({ resolved: false, callback: this.stopQuestion });
        setTimeout(() => this.resolveAction(this.toBeResolved.length - 1), this.config.delay);
        this.acceptingResponses = true;
        this.announceCallback({
            type: 'question',
            content: question.content,
            answers: question.answers.map((answer) => {
                return { content: answer.content };
            })
        });
    }

    private stopQuestion() {
        this.toBeResolved.push({ resolved: false, callback: this.announceNextQuestion });
        this.acceptingResponses = false;
        this.announceCallback({
            type: 'leaderboard'
        });
    }

    public resolveAction(actionID: number): void {
        const action = this.toBeResolved[actionID];
        if (action !== undefined && action.resolved === false) {
            action.resolved = true;
            action.callback();
        } else {
            //do somethig D:
        }
    }

}

export function createGame(config: GameConfig, announceCallback: (action: Action) => void): Gamemode {
    return new Quiz(config, announceCallback);
}