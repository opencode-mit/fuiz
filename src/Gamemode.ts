export interface Gamemode {

}

class Quiz implements Gamemode {
    public constructor(config: JSON) {}
}

export function createGame(config: JSON): Gamemode {
    return new Quiz(config);
}