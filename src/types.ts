/**
 * Represent a token used for authentication.
 */
export type Hash = string;
export const HASH_LENGTH = 32;
export const ALPHABET = "abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890";

export enum ActionType {Question, QuestionOnly, Leaderboard, Statistics, Join};

export enum PlayingMode {Desktop, Mobile};

export enum GamemodeName {Quiz};

export enum GameResponseType {Answer, Resolve};

/**
 * Represents an answer and if it's correct or not.
 */
export type AnswerChoiceSolved = {
    content: string,
    correct: boolean
}

/**
 * Represents answer.
 */
type AnswerChoice = {
    content: string
}

export type AnswerChoiceStatistics = {
    answerChoice: AnswerChoiceSolved,
    votedCount: number
}

/**
 * Represnts a question and its possible answers.
 */
export type QuestionSolved = {
    content: string,
    imageURL?: string,
    answerChoices: Array<AnswerChoiceSolved>
}

/**
 * Represnts a question.
 */
export type Question = {
    content: string,
    imageURL?: string,
    answerChoices: Array<AnswerChoice>
}

/**
 * Represents a configuration of a Question
 */
export type QuestionConfig = {
    content: string,
    imageURL?: string,
    answerChoices: Array<AnswerChoiceSolved>,
    score?: number,
    questionDelaySeconds?: number,
    answersDelaySeconds?: number,
}

/**
 * Represents a game configuration.
 */
export type GameConfig = QuizConfig;

export type QuizConfig = {
    gamemode: GamemodeName.Quiz,
    questionDelaySeconds: number,
    answersDelaySeconds: number,
    score?: number,
    mode: PlayingMode,
    questions: Array<QuestionConfig>
};

export type Leaderboard = Array<{ playerID: PlayerID, score: number }>;

/**
 * Represents an action announced to players/hosts/watchers.
 */
export type Action = {
    type: ActionType.Question,
    timeOfAnnouncement: number,
    durationSeconds?: number,
    question: Question,
    questionID: number,
    mode: PlayingMode,
    actionID?: number
} | {
    type: ActionType.Leaderboard,
    timeOfAnnouncement: number,
    final: boolean,
    results: Leaderboard
    mode: PlayingMode,
    actionID?: number
} | {
    type: ActionType.Statistics,
    timeOfAnnouncement: number,
    question: Question,
    questionID: number,
    answerStatistics: Array<AnswerChoiceStatistics>,
    totalVoted: number,
    mode: PlayingMode,
    actionID?: number
} | {
    type: ActionType.QuestionOnly,
    timeOfAnnouncement: number,
    textContent: string
    durationSeconds?: number,
    questionID: number,
    mode: PlayingMode,
    actionID?: number
} | {
    type: ActionType.Join,
    timeOfAnnouncement: number,
    mode: PlayingMode,
    people: Array<PlayerID>
};

export type Announcement = {
    action: Action,
    serverTime: number
}

export type GameResponse = {
    type: GameResponseType.Answer,
    sessionID: SessionID,
    playerID: PlayerID,
    playerToken: Hash,
    questionID: number,
    answerID: number
} | {
    type: GameResponseType.Resolve,
    sessionID: SessionID,
    actionID: number,
    token: Hash
}

/**
 * Represents unique SessionID genereated at random.
 */
export type SessionID = string;
export const SESSION_ID_LENGTH = 6;
export const EASY_ALPHABET = "023456789ACDEFGHJKLOQRSTUVWXYZ"; // broad research concludes that these letters are easy to say

/**
 * Represents a unique playerID given by the player.
 */
export type PlayerID = string;

export class AuthenticationError extends Error {
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AuthenticationError.prototype)
    }

    getReason() {
        return this.message;
    }
}

export class JoiningError extends Error {
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, JoiningError.prototype);
    }

    getReason() {
        return this.message;
    }
}

export type SocketID = string;