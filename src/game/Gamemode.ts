import { GameConfig, Action, PlayerID } from "../types";
import { Deferred } from "./Deferred";

/**
 * Represents an answer by a Player at a certain time.
 */
type Answer = {
    answerID: number,
    timeSubmitted: number
}

/**
 * Represents a Gamemode that takes answers and communicates with the server.
 */
export interface Gamemode {

    /**
     * Registers an answer by the player.
     * 
     * @param questionID index of the question (0-indexed)
     * @param playerID the assigned playerID
     * @param answerID the index of the answer (0-indexed)
     */
    submitAnswer(questionID: number, playerID: PlayerID, answerID: number): void;

    /**
     * Resolves the given action and calls its callback.
     * 
     * @param actionID index of the action (0-indexed)
     */
    resolveAction(actionID: number): void;

    /**
     * Registers a new player to the game.
     * 
     * @param playerID thew new PlayerID
     */
    registerPlayer(playerID: PlayerID): void;
}

export class Quiz implements Gamemode {

    // Abstraction Function
    // AF(toBeResolved, answers, currentQuestion, acceptingResponses, questionTimes) =
    //      A quiz game last displayed the question #currentQuestion and is accepting
    //      responses based on acceptingResponses, it showed the times where these 
    //      questions were announced in questionTimes, and stores players answers for 
    //      each question in answers, it has a list of promises to be resolved for the
    //      quiz to progress


    private readonly toBeResolved: Array<{ resolved: boolean, deferred: Deferred<void> }> = [];
    private readonly answers: Array<Map<PlayerID, Answer>> = [];
    private readonly players: Set<PlayerID> = new Set();
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
        const startGameDeferred = new Deferred<void>();
        const self = this;
        startGameDeferred.promise.then(() => self.startGame());
        this.toBeResolved.push({ resolved: false, deferred: startGameDeferred });
    }

    /**
     * @inheritdoc
     */
    public submitAnswer(questionID: number, playerID: string, answerID: number): void {
        const questionAnswers = this.answers[questionID];
        if (this.players.has(playerID) && this.acceptingResponses && questionAnswers !== undefined && this.currentQuestion === questionID && questionAnswers.get(playerID) === undefined) {
            questionAnswers.set(playerID, { answerID: answerID, timeSubmitted: Date.now() });
            if (questionAnswers.size === this.players.size) {
                this.resolveAction(this.toBeResolved.length - 1);
            }
        } else {
            // do something D:
        }
    }

    /**
     * Starts the Quiz by showing first question.
     */
    private startGame(): void {
        this.currentQuestion = -1;
        this.announceQuestion();
    }

    /**
     * Announces the next available question.
     * Adds an action once resolved it will start receiving answers.
     */
    private announceQuestion(): void {
        this.currentQuestion++;
        const question = this.config.questions[this.currentQuestion];
        if (question === undefined) return;
        const questionDeferred = new Deferred<void>();
        const self = this;
        questionDeferred.promise.then(() => self.receiveAnswers());
        const deferredID = this.toBeResolved.length;
        this.toBeResolved.push({ resolved: false, deferred: questionDeferred });
        setTimeout(() => this.resolveAction(deferredID), this.config.questionDelay);
        this.announceCallback({
            type: 'question_only',
            duration: this.config.questionDelay,
            time: Date.now(),
            questionID: this.currentQuestion,
            content: question.content,
            actionID: deferredID
        });
    }

    /**
     * Announces the answers and starts admitting answers immediately.
     * Adds an action once resolved it will stop admitting answers and shows statistics.
     */
    private receiveAnswers(): void {
        const question = this.config.questions[this.currentQuestion];
        if (question === undefined) return;
        const questionDeferred = new Deferred<void>();
        const self = this;
        questionDeferred.promise.then(() => self.announceStatistics());
        const deferredID = this.toBeResolved.length;
        this.toBeResolved.push({ resolved: false, deferred: questionDeferred });
        setTimeout(() => this.resolveAction(deferredID), this.config.answersDelay);
        this.acceptingResponses = true;
        this.answers.push(new Map());
        this.questionTimes.push(Date.now());
        this.announceCallback({
            type: 'question',
            duration: this.config.answersDelay,
            time: Date.now(),
            questionID: this.currentQuestion,
            content: question.content,
            answers: question.answers.map((answer) => {
                return { content: answer.content };
            }),
            actionID: deferredID
        });
    }

    /**
     * Announces the statistics of the answers and how many voted for each.
     * Adds an action once resolved it will show the leaderboard.
     */
    private announceStatistics(): void {
        this.acceptingResponses = false;
        const question = this.config.questions[this.currentQuestion];
        if (question === undefined) return;
        const questionDeferred = new Deferred<void>();
        const self = this;
        questionDeferred.promise.then(() => self.announceLeaderboard());
        const deferredID = this.toBeResolved.length;
        this.toBeResolved.push({ resolved: false, deferred: questionDeferred });
        const lastAnswers = this.answers[this.currentQuestion];
        if (lastAnswers === undefined) return;
        this.announceCallback({
            type: 'statistics',
            time: Date.now(),
            question: {
                questionID: this.currentQuestion,
                content: question.content,
                ...(question.imageURL) && {imageURL: question.imageURL},
                answers: question.answers
            },
            answers: question.answers.map((answer, answerID) => {
                return {answer: { content: answer.content, correct: answer.correct }, voted: [...lastAnswers.values()].filter(playerAnswer => playerAnswer.answerID === answerID).length};
            }),
            total: lastAnswers.size,
            actionID: deferredID
        });
    }

    /**
     * Calculates the leaderboard by rewarding one point to each correct response.
     * 
     * @returns playerIDs and their associated score
     */
    private calculateLeaderboard(): Array<{ playerID: PlayerID, score: number }> {
        const scores = new Map<PlayerID, number>();
        for (const playerID of this.players) {
            scores.set(playerID, 0);
        }
        for (let questionID = 0; questionID < this.questionTimes.length; questionID++) {
            const playerAnswers = this.answers[questionID];
            const question = this.config.questions[questionID];
            if (question === undefined) continue;
            const questionAnswers = question.answers;
            if (playerAnswers === undefined || questionAnswers === undefined) continue; //TODO: should be assert
            for (const [playerID, playerAnswer] of playerAnswers) {
                const currentAnswer = questionAnswers[playerAnswer.answerID];
                if (currentAnswer !== undefined && currentAnswer.correct === true) {
                    const currentScore = scores.get(playerID) ?? 0;
                    scores.set(playerID, currentScore + 1);
                }
            }
        }
        const leaderboard = new Array<{ playerID: PlayerID, score: number }>();
        for (const [playerID, score] of scores.entries()) {
            leaderboard.push({ playerID: playerID, score: score });
        }
        leaderboard.sort((a, b) => b.score - a.score);
        return leaderboard;
    }

    /**
     * Shows the leaderboard.
     * It also adds an action once resolved will show next question if available.
     */
    private announceLeaderboard(): void {
        if (this.currentQuestion < this.config.questions.length - 1) {
            const leaderboardDeferred = new Deferred<void>();
            const self = this;
            const deferredID = this.toBeResolved.length;
            leaderboardDeferred.promise.then(() => self.announceQuestion());
            this.toBeResolved.push({ resolved: false, deferred: leaderboardDeferred });
            this.announceCallback({
                type: 'leaderboard',
                time: Date.now(),
                final: this.currentQuestion === this.config.questions.length - 1,
                results: this.calculateLeaderboard(),
                actionID: deferredID
            });
        } else {
            this.announceCallback({
                type: 'leaderboard',
                time: Date.now(),
                final: this.currentQuestion === this.config.questions.length - 1,
                results: this.calculateLeaderboard()
            });
        }
    }

    /**
     * @inheritdoc
     */
    public resolveAction(actionID: number): void {
        const action = this.toBeResolved[actionID];
        if (action !== undefined && action.resolved === false) {
            console.log(`resolved ${actionID}`);
            action.resolved = true;
            action.deferred.resolve();
        } else {
            //do somethig D:
        }
    }

    /** 
     * @inheritdoc 
     */
    public registerPlayer(playerID: string): void {
        this.players.add(playerID);
        if (this.currentQuestion === -1) {
            this.announceCallback({
                type: 'join',
                time: Date.now(),
                people: [...this.players]
            });
        }
    }
}

/**
 * Creates a Quiz game with the given configuration.
 * 
 * @param config the game configuration
 * @param announceCallback the function to call to announce actions
 * @returns a gamemode instance depending on the game configuration
 */
export function createQuiz(config: GameConfig, announceCallback: (action: Action) => void): Gamemode {
    return new Quiz(config, announceCallback);
}