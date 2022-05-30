/**
 * Represent a token used for authentication.
 */
export type Hash = string;

/**
 * Represents an answer and if it's correct or not.
 */
type AnswerSolved = {
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
    answers: Array<AnswerSolved>
}

/**
 * Represnts a question.
 */
export type Question = {
    content: string,
    answers: Array<Answer>
}

/**
 * Represents a game configuration.
 */
export type GameConfig = {
    gamemode: 'quiz',
    delay: number,
    questions: Array<QuestionSolved> 
};

export type Leaderboard = Array<{playerID: PlayerID, score: number}>;

/**
 * Represents an action announced to players/hosts/watchers.
 */
export type Action = {
    type: 'question',
    content: string,
    answers: Array<Answer>
} | {
    type: 'leaderboard',
    final: boolean,
    results: Leaderboard
} | {
    type: 'statistics',
    content: string,
    answers: Array<Answer>
} | {
    type: 'question_only',
    content: string
};

/**
 * Represents unique SessionID genereated at random.
 */
export type SessionID = string;

/**
 * Represents a unique playerID given by the player.
 */
export type PlayerID = string;
