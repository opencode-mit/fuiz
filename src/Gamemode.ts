import { GameConfig, Action } from ".";

export interface Gamemode {

}

class Quiz implements Gamemode {
    
    public constructor(
        config: GameConfig,
        private readonly announceCallback: (action: Action) => void
    ) { }
}

export function createGame(config: GameConfig, announceCallback: (action: Action) => void): Gamemode {
    return new Quiz(config, announceCallback);
}