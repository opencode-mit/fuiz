import assert from 'assert';
import { Server } from 'http';
import express, { Application, json } from 'express';
import HttpStatus from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { GameManager } from './Server';

export class WebServer {
    private readonly app: Application;
    private server: Server | undefined;

    public constructor(private readonly gameManager: GameManager, private readonly port: number) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });

        this.app.post('/register', (request, response) => {
            const { jsonConfig } = request.body;
            console.log(jsonConfig);
            assert(jsonConfig);
            const config = JSON.parse(jsonConfig);
            const { sessionID, token } = this.gameManager.registerHost(config);
            response
                .status(HttpStatus.ACCEPTED)
                .type('json')
                .send(JSON.stringify({ sessionID: sessionID, token: token }));
        });

        this.app.post('/resolve', (request, response) => {
            const { sessionID, token, actionID } = request.body;
            assert(sessionID);
            assert(token);
            assert(actionID);
            this.gameManager.resolveAction(sessionID, Number.parseInt(actionID), token);
            response.status(HttpStatus.ACCEPTED);
        });
    }

    public start(): Promise<void> {
        return new Promise(resolve => {
            this.server = this.app.listen(this.port, () => {
                console.log('server now listening at', this.port);
                resolve();
            });
        });
    }

    public stop(): void {
        this.server?.close();
        console.log('server stopped');
    }
}