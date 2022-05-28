export type GameConfig = {
    gamemode: string,
    delay: number,
    questions: Array<{
        content: string,
        answers: Array<{
            content: string,
            correct: boolean
        }>
    }> 
};
export type Action = {
    type: 'question',
    content: string,
    answers: Array<{
        content: string
    }>
} | {
    type: 'leaderboard'
};
export type SessionID = string;
export type PlayerID = string;
