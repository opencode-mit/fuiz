/**
 * Represent a token used for authentication.
 */
export type Hash = string;
export const HASH_LENGTH = 32;
export const ALPHABET = "abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890";

/**
 * Represents an answer and if it's correct or not.
 */
export type AnswerSolved = {
    content: string,
    correct: boolean
}

/**
 * Represents answer.
 */
type Answer = {
    content: string
}

/**
 * Represnts a question and its possible answers.
 */
type QuestionSolved = {
    content: string,
    imageURL?: string,
    answers: Array<AnswerSolved>
}

/**
 * Represnts a question.
 */
export type Question = {
    content: string,
    imageURL?: string,
    answers: Array<Answer>
}

/**
 * Represents a game configuration.
 */
export type GameConfig = {
    gamemode: 'quiz',
    questionDelay: number,
    answersDelay: number,
    questions: Array<QuestionSolved>
};

export type Leaderboard = Array<{ playerID: PlayerID, score: number }>;

/**
 * Represents an action announced to players/hosts/watchers.
 */
export type Action = {
    type: 'question',
    time: number,
    duration?: number,
    question: Question,
    questionID: number,
    actionID?: number
} | {
    type: 'leaderboard',
    time: number,
    final: boolean,
    results: Leaderboard
    actionID?: number
} | {
    type: 'statistics',
    time: number,
    question: Question,
    questionID: number,
    answers: Array<{answer: AnswerSolved, voted: number}>,
    total: number,
    actionID?: number
} | {
    type: 'question_only',
    time: number,
    content: string
    duration?: number,
    questionID: number,
    actionID?: number
} | {
    type: 'join',
    time: number,
    people: Array<PlayerID>
};

export type Announcement = {
    action: Action,
    serverTime: number
}

export type ClientAnswer = {
    type: 'answer',
    sessionID: SessionID,
    playerID: PlayerID,
    playerToken: Hash,
    questionID: number,
    answerID: number
} | {
    type: 'resolve',
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

export type SocketID = string;