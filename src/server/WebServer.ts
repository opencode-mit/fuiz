import assert from 'assert';
import { Server } from 'http';
import express, { Application, json } from 'express';
import HttpStatus from 'http-status-codes';
import asyncHandler from 'express-async-handler';
import { GameManager } from '../game/GameManager';
import { AuthenticationError } from '../types';
import path from 'path';

export class WebServer {
    private readonly app: Application;
    public server: Server | undefined;

    public constructor(private readonly gameManager: GameManager, private readonly port: number) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            response.set('Access-Control-Allow-Origin', '*');
            next();
        });

        this.app.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, '../../index.html'));
        });

        this.app.get('/style/style.css', function (req, res) {
            res.sendFile(path.join(__dirname, '../../style/style.css'));
        });

        this.app.get('/dist/client/client-bundle.js', function (req, res) {
            res.sendFile(path.join(__dirname, '../../dist/client/client-bundle.js'));
        });

        this.app.get('/media/:filename', function (req, res) {
            const { filename } = req.params;
            res.sendFile(path.join(__dirname, '../../media/' + filename));
        });

        this.app.post('/register', (request, response) => {
            try {
                const { jsonConfig } = request.body;
                assert(jsonConfig);
                const { sessionID, token } = this.gameManager.registerHost(jsonConfig);
                response
                    .status(HttpStatus.ACCEPTED)
                    .type('json')
                    .send(JSON.stringify({ sessionID: sessionID, token: token }));
            } catch (error) {
                response
                    .status(HttpStatus.BAD_REQUEST)
                    .send();
            }
        });

        this.app.post('/registerPlayer', (request, response) => {
            try {
                const { sessionID, playerID, socketID } = request.body;
                assert(sessionID && playerID);
                const token = this.gameManager.registerPlayer(socketID, sessionID, playerID);
                response
                    .status(HttpStatus.ACCEPTED)
                    .type('json')
                    .send(JSON.stringify({ token: token }));
            } catch (error) {
                response
                    .status(HttpStatus.BAD_REQUEST)
                    .send();
            }
        });

        this.app.post('/resolve', (request, response) => {
            const { sessionID, token, actionID } = request.body;
            if (sessionID === undefined || sessionID === undefined || actionID === undefined) {
                response
                    .status(HttpStatus.BAD_REQUEST)
                    .type('json')
                    .send({ status: "fail", message: "bad parameters" });
                return;
            }
            try {
                this.gameManager.resolveAction(sessionID, Number.parseInt(actionID), token);
                response
                    .status(HttpStatus.ACCEPTED)
                    .type('json')
                    .send({ status: "success" });
            } catch (error) {
                if (error instanceof AuthenticationError) {
                    response
                        .status(HttpStatus.BAD_REQUEST)
                        .type('json')
                        .send({ status: "fail", message: error.getReason() });
                    return;
                } else {
                    response
                        .status(HttpStatus.BAD_REQUEST)
                        .type('json')
                        .send({ status: "fail", message: "something went wrong" });
                    return;
                }
            }
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