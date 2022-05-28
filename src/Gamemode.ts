import { GameConfig, Action } from ".";
import { PlayerID } from ".";

/**
 * Represents an answer by a Player at a certain time.
 */
type Answer = {
    playerID: PlayerID,
    answerID: number,
    timeSubmitted: number
}

export interface Gamemode {

    /**
     * Registers an answer by the player.
     * 
     * @param questionID index of the question (0-indexed)
     * @param playerID the assigned playerID
     * @param answerID the index of the question (0-indexed)
     */
    submitAnswer(questionID: number, playerID: PlayerID, answerID: number): void;

    /**
     * Resolves the given action and calls its callback.
     * 
     * @param actionID index of the action (0-indexed)
     */
    resolveAction(actionID: number): void;
}

class Quiz implements Gamemode {

    private readonly toBeResolved: Array<{ resolved: boolean, callback: () => void }> = [];
    private readonly answers: Array<Array<Answer>> = [];
    private currentQuestion = -1;
    private acceptingResponses = false;
    private readonly questionTimes: number[] = [];

    /**
     * Creates a Quiz with the given configuration.
     * 
     * @param config the configuration of the game
     * @param announceCallback function to use to announce actions
     */
    public constructor(
        private readonly config: GameConfig,
        private readonly announceCallback: (action: Action) => void
    ) {
        this.toBeResolved.push({ resolved: false, callback: this.startGame })
    }

    /**
     * @inheritdoc
     */
    public submitAnswer(questionID: number, playerID: string, answerID: number): void {
        const questionAnswers = this.answers[questionID];
        if (this.acceptingResponses && questionAnswers !== undefined && this.currentQuestion === questionID) {
            questionAnswers.push({ playerID: playerID, answerID: answerID, timeSubmitted: Date.now() });
        } else {
            // do something D:
        }
    }

    /**
     * Starts the Quiz by showing first question.
     */
    private startGame(): void {
        this.announceNextQuestion();
    }

    /**
     * Announces the next available question and recieves answers immediately.
     * Adds an action once resolved it will stop recieving answers and will show leaderboard.
     */
    private announceNextQuestion(): void {
        this.currentQuestion++;
        const question = this.config.questions[this.currentQuestion];
        if (question === undefined) return;
        this.toBeResolved.push({ resolved: false, callback: this.stopQuestion });
        setTimeout(() => this.resolveAction(this.toBeResolved.length - 1), this.config.delay);
        this.acceptingResponses = true;
        this.answers.push([]);
        this.questionTimes.push(Date.now());
        this.announceCallback({
            type: 'question',
            content: question.content,
            answers: question.answers.map((answer) => {
                return { content: answer.content };
            })
        });
    }

    /**
     * Calculates the leaderboard by rewarding one point to each correct response.
     * 
     * @returns playerIDs and their associated score
     */
    private calculateLeaderboard(): Array<{playerID: PlayerID, score: number}> {
        const scores = new Map<PlayerID, number>();
        for(let questionID = 0; questionID < this.questionTimes.length; questionID++) {
            const playerAnswers = this.answers[questionID];
            const questionAnswers = this.config.questions[questionID].answers;
            if(playerAnswers === undefined || questionAnswers === undefined) continue; //TODO: should be assert
            for(const playerAnswer of playerAnswers) {
                const currentAnswer = questionAnswers[playerAnswer.answerID];
                if(currentAnswer !== undefined && currentAnswer.correct === true){
                    const currentScore = scores.get(playerAnswer.playerID) ?? 0;
                    scores.set(playerAnswer.playerID, currentScore + 1);
                }
            }
        }
        const leaderboard = new Array<{playerID: PlayerID, score: number}>();
        for(const [playerID, score] of scores.entries()) {
            leaderboard.push({playerID: playerID, score: score});
        }
        return leaderboard;
    }

    /**
     * Stops accepting responses and shows the leaderboard.
     * In addition, it adds an action once resolved will show next question if available.
     */ 
    private stopQuestion(): void {
        if (this.currentQuestion < this.config.questions.length - 1) {
            this.toBeResolved.push({ resolved: false, callback: this.announceNextQuestion });
        }
        this.acceptingResponses = false;
        this.announceCallback({
            type: 'leaderboard',
            final: this.currentQuestion === this.config.questions.length - 1,
            results: this.calculateLeaderboard()
        });
    }

    /**
     * @inheritdoc
     */
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

/**
 * Creates a game with the given configuration.
 * 
 * @param config the game configuration
 * @param announceCallback the function to call to announce actions
 * @returns a gamemode instance depending on the game configuration
 */
export function createGame(config: GameConfig, announceCallback: (action: Action) => void): Gamemode {
    return new Quiz(config, announceCallback);
}