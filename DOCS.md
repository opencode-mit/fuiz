Server ADT:
    mapping: (sessionID: string) -> (token: hash, game: Gamemode ADT, mapping (playerID: string) -> (token: hash))

    registerHost(config: json): {sessionID: string, token: hash}
        register a current fuiz with the given configuration, returns a sessionID and a token to be passed
        in later calls to the server ADT
    
    registerPlayer(sessionID: string, playerID: string): {playerToken: hash}
        registers a player to the given sessionID with a username, it must be unique, if successful it will
        return the token to be passed in later calls to the ADT

    showNextQuestion(sessionID: string, token: hash): {question: json}

    submitAnswer(sessionID: string, playerID: string, playerToken: hash, answerID: string)

    showLeaderboard(sessionID: string, token: hash)
        sends leaderboard to current active users of given sessionID


Client ADT:
    registerPlayer(sessionID: string, playerID: string)

    sendAnswer(answerID: string)

    onReceiveQuestion(question: event)

    onReceiveLeaderboard(leaderboard: event)


Gamemode ADT:
    constructor(config: json)

    getNextQuestion(): {question: json}

    getLeaderboard(): {leaderboard: json}

    submitAnswer(playerID: string, answerID: string)


Host ADT:
    startGame(config: json)

    showLeaderboard()

    showNextQuestion()