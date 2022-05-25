Server ADT:
    mapping: (sessionID: string) -> (token: hash, game: Gamemode ADT, watchers: string[], mapping (playerID: string) -> (token: hash))

    registerHost(config: json): {sessionID: string, token: hash}
        register a current fuiz with the given configuration, returns a sessionID and a token to be passed
        in later calls to the server ADT
    
    registerPlayer(sessionID: string, playerID: string): {playerToken: hash}
        registers a player to the given sessionID with a username, it must be unique, if successful it will
        return the token to be passed in later calls to the ADT

    registerWatcher(sessionID: string):
        registers a watcher to the given sessionID

    resolveAction(sessionID: string, actionID: number, token: hash)

    submitAnswer(sessionID: string, playerID: string, playerToken: hash, answerID: string)

    private announceAction(sessionID: string, action: json)
        sends action to current active users of given sessionID



Client ADT:
    registerPlayer(sessionID: string, playerID: string)

    sendAnswer(answerID: string)

    onReceiveAction(action: event)



Gamemode ADT:
    constructor(config: json, announceAction: (action) -> void)

    resolveAction(actionID: number): {action: json}

    submitAnswer(questionID: number, playerID: string, answerID: string)



Host ADT:
    startGame(config: json)

    resolveAction(actionID: number)