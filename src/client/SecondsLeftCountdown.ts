export default class SecondsLeftCountdown {

    // AF(initialTime, callback, timeoutID, intervalID): Integer countdown for seconds starting from floor(initialTime)
    //      until it reaches 0 inclusive, it calls callback(timeLeft) for every step, and stores timeoutID and intervalID
    //      to stop execution if needed

    private timeoutID: NodeJS.Timer | undefined;
    private intervalID: NodeJS.Timer | undefined;
    
    public constructor(
        private initialTime: number,
        private readonly callback: (timeLeft: number) => void
    ) {
        if (initialTime < 0) return;
        let numberOfSeconds = Math.floor(initialTime / 1000);
        const self = this;
        self.timeoutID = setTimeout(() => {
            //first call
            callback(numberOfSeconds);
            numberOfSeconds--;
            
            //further calls
            self.intervalID = setInterval(() => {
                if (numberOfSeconds < 0) {
                    //stop calling before going into negative
                    self.clear();
                    return;
                }
                callback(numberOfSeconds);
                numberOfSeconds--;
            }, 1000); //countdown every second
        }, initialTime % 1000); //remove trailing parts of a second
    }

    public clear(): void {
        if(this.timeoutID !== undefined) clearTimeout(this.timeoutID);
        if(this.intervalID !== undefined) clearInterval(this.intervalID);
    }
}