/**
 * Represents an answer and if it's correct or not.
 */
type answerSolved = {
    content: string,
    correct: boolean
}

/**
 * Represents answer.
 */
type answer = {
    content: string
}

/**
 * Represnts a question and its possible answers.
 */
type questionSolved = {
    content: string,
    answers: Array<answerSolved>
}

/**
 * Represnts a question.
 */
 type question = {
    content: string,
    answers: Array<answer>
}

/**
 * Represents a game configuration.
 */
export type GameConfig = {
    gamemode: 'quiz',
    delay: number,
    questions: Array<questionSolved> 
};

/**
 * Represents an action announced to players/hosts/watchers.
 */
export type Action = {
    type: 'question',
    content: string,
    answers: Array<answer>
} | {
    type: 'leaderboard',
    final: boolean,
    results: Array<{playerID: PlayerID, score: number}>
} | {
    type: 'statistics',
    content: string,
    answers: Array<answer>
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
