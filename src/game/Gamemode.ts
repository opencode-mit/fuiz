import { GameConfig, Action, PlayerID, ActionType, PlayingMode, QuizConfig, QuestionSolved, AnswerChoiceSolved, GamemodeName } from "../types";
import sanitizeHtml from 'sanitize-html';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { Deferred } from "./Deferred";
import assert from "assert";

function sanitize(dirty: string): string {
    return sanitizeHtml(dirty);
}

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

    /**
     * @returns last action that was broadcasted.
     */
    lastAction(): Action;
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
    private lastAnnouncedAction: Action;

    private static readonly QUESTION_SCORE = 1000;
    private static readonly QUESTION_DELAY_SECONDS = 3;
    private static readonly ANSWERS_DELAY_SECONDS = 30;

    /**
     * checks if object is an array of solved answer choices (check types.ts)
     * 
     * @param answerChoices an object set for check
     * @returns true iff the object represents an array of solved answer choices
     */
    private static checkArraySolvedChoices(answerChoices: any): answerChoices is Array<AnswerChoiceSolved> {
        return Array.isArray(answerChoices) && answerChoices.every((choice) => {
            return typeof choice.content === "string" && typeof choice.correct === "boolean"
        });
    }

    /**
     * checks if object is an array of solved questions (check types.ts)
     * 
     * @param questions an object set for check
     * @returns true iff the object represents an array of solved questions
     */
    private static checkArrayQuestionSolved(questions: any): questions is Array<QuestionSolved> {
        return Array.isArray(questions) && questions.every((question) => {
            return typeof question.content === "string"
                && this.checkArraySolvedChoices(question.answerChoices);
        });
    }

    /**
     * checks if given config is a valid QuizConfig (check types.ts)
     * 
     * @param config given configuration object
     * @returns true iff config is a valid QuizConfig
     */
    public static checkConfig(config: any): config is QuizConfig {
        return config.gamemode === 0
            && typeof config.mode === "number"
            && config.mode in PlayingMode
            && this.checkArrayQuestionSolved(config.questions);
    }

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
        const firstAction: Action = {
            type: ActionType.Join,
            timeOfAnnouncement: Date.now(),
            mode: this.config.mode,
            people: [...this.players]
        };
        this.lastAnnouncedAction = firstAction;
        this.announceCallback(firstAction);
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
        this.acceptingResponses = false;
        this.questionTimes.splice(0, this.questionTimes.length);
        this.answers.splice(0, this.answers.length);
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
        const delay = (question.questionDelaySeconds ?? this.config.questionDelaySeconds ?? Quiz.QUESTION_DELAY_SECONDS) * 1000;
        setTimeout(() => this.resolveAction(deferredID), delay);
        const questionOnlyAction: Action = {
            type: ActionType.QuestionOnly,
            durationSeconds: delay,
            timeOfAnnouncement: Date.now(),
            questionID: this.currentQuestion,
            textContent: sanitize(question.content),
            mode: this.config.mode,
            actionID: deferredID
        };
        this.lastAnnouncedAction = questionOnlyAction;
        this.announceCallback(questionOnlyAction);
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
        const delay = (question.answersDelaySeconds ?? this.config.answersDelaySeconds ?? Quiz.ANSWERS_DELAY_SECONDS) * 1000;
        setTimeout(() => this.resolveAction(deferredID), delay);
        this.acceptingResponses = true;
        this.answers.push(new Map());
        this.questionTimes.push(Date.now());
        const questionAction: Action = {
            type: ActionType.Question,
            durationSeconds: delay,
            timeOfAnnouncement: Date.now(),
            questionID: this.currentQuestion,
            question: {
                content: sanitize(question.content),
                ...(question.imageURL) && { imageURL: sanitizeUrl(question.imageURL) },
                answerChoices: question.answerChoices.map((answer) => {
                    return { content: sanitize(answer.content) }
                })
            },
            mode: this.config.mode,
            actionID: deferredID
        };
        this.lastAnnouncedAction = questionAction;
        this.announceCallback(questionAction);
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
        const statisticsAction: Action = {
            type: ActionType.Statistics,
            timeOfAnnouncement: Date.now(),
            questionID: this.currentQuestion,
            question: {
                content: sanitize(question.content),
                ...(question.imageURL) && { imageURL: sanitizeUrl(question.imageURL) },
                answerChoices: question.answerChoices.map((answer) => {
                    return { content: sanitize(answer.content) }
                })
            },
            answerStatistics: question.answerChoices.map((answer, answerID) => {
                return { answerChoice: { content: sanitize(answer.content), correct: answer.correct }, votedCount: [...lastAnswers.values()].filter(playerAnswer => playerAnswer.answerID === answerID).length };
            }),
            totalVoted: lastAnswers.size,
            mode: this.config.mode,
            actionID: deferredID
        };
        this.lastAnnouncedAction = statisticsAction;
        this.announceCallback(statisticsAction);
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
            const questionTime = this.questionTimes[questionID];
            assert(question && playerAnswers && questionTime);
            const questionAnswers = question.answerChoices;
            assert(questionAnswers);
            const maxScore = (question.score ?? this.config.score ?? Quiz.QUESTION_SCORE);
            for (const [playerID, playerAnswer] of playerAnswers) {
                const currentAnswer = questionAnswers[playerAnswer.answerID];
                if (currentAnswer !== undefined && currentAnswer.correct === true) {
                    const currentScore = scores.get(playerID) ?? 0;
                    const delay = (question.answersDelaySeconds ?? this.config.answersDelaySeconds ?? Quiz.ANSWERS_DELAY_SECONDS) * 1000;
                    const additionalScore = Math.round(maxScore * (1 - ((playerAnswer.timeSubmitted - questionTime) / delay) / 2));
                    scores.set(playerID, currentScore + additionalScore);
                }
            }
        }
        const leaderboard = new Array<{ playerID: PlayerID, score: number }>();
        for (const [playerID, score] of scores.entries()) {
            leaderboard.push({ playerID: sanitize(playerID), score: score });
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
            const leaderboardAction: Action = {
                type: ActionType.Leaderboard,
                timeOfAnnouncement: Date.now(),
                final: this.currentQuestion === this.config.questions.length - 1,
                results: this.calculateLeaderboard(),
                mode: this.config.mode,
                actionID: deferredID
            };
            this.lastAnnouncedAction = leaderboardAction;
            this.announceCallback(leaderboardAction);
        } else {
            const leaderboardAction: Action = {
                type: ActionType.Leaderboard,
                timeOfAnnouncement: Date.now(),
                final: this.currentQuestion === this.config.questions.length - 1,
                mode: this.config.mode,
                results: this.calculateLeaderboard()
            };
            this.lastAnnouncedAction = leaderboardAction;
            this.announceCallback(leaderboardAction);
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
            const joinAction: Action = {
                type: ActionType.Join,
                timeOfAnnouncement: Date.now(),
                mode: this.config.mode,
                people: [...this.players]
            };
            this.lastAnnouncedAction = joinAction;
            this.announceCallback(joinAction);
        }
    }

    /**
     * @inheritdoc
     */
    public lastAction(): Action {
        return this.lastAnnouncedAction;
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
    if (config.gamemode === GamemodeName.Quiz) {
        if (!Quiz.checkConfig(config)) {
            throw new SyntaxError("Failed to parse config");
        }
        return new Quiz(config, announceCallback);
    } else {
        throw new SyntaxError("Failed to parse config");
    }
}