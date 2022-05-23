Server ADT:
    mapping: (sessionID: string) -> (token: hash, game: Gamemode ADT, mapping (playerID: string) -> (token: hash))

    registerHost(config: json): {sessionID: string, token: hash}
        register a current fuiz with the given configuration, returns a sessionID and a token to be passed
        in later calls to the server ADT
    
    registerPlayer(sessionID: string, playerID: string): {playerToken: hash}
        registers a player to the given sessionID with a username, it must be unique, if successful it will
        return the token to be passed in later calls to the ADT

    getNextAction(sessionID: string, token: hash)

    submitAnswer(sessionID: string, playerID: string, playerToken: hash, answerID: string)

    private showLeaderboard(sessionID: string, leaderboard: json)
        sends leaderboard to current active users of given sessionID

    private showQuestion(sessionID: string, question: json)
        sends a question to current active users of given sessionID

    private showStatistics(sessionID: string, question: json)
        sends statistics/correct answers to current active users of given session ID


Client ADT:
    registerPlayer(sessionID: string, playerID: string)

    sendAnswer(answerID: string)

    onReceiveQuestion(question: event)

    onReceiveLeaderboard(leaderboard: event)

    onReceiveStatistics(stats: event)


Gamemode ADT:
    constructor(config: json)

    getNextAction(): {action: json}

    submitAnswer(playerID: string, answerID: string)


Host ADT:
    startGame(config: json)

    continue(config: json)