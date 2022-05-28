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

    public constructor(
        config: GameConfig,
        private readonly announceCallback: (action: Action) => void
    ) { }

    public submitAnswer(questionID: number, playerID: string, answerID: number): void {
        const questionAnswers = this.answers[questionID];
        if (questionAnswers !== undefined && this.currentQuestion === questionID) {
            questionAnswers.push({ playerID: playerID, answerID: answerID, timeSubmitted: Date.now() });
        } else {
            // do something D:
        }
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