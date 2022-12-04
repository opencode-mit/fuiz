import assert from 'assert';
import http from 'http';
import express, { Application, json } from 'express';
import HttpStatus from 'http-status-codes';
import https from 'https';
import asyncHandler from 'express-async-handler';
import { GameManager } from '../game/GameManager';
import { AuthenticationError, JoiningError } from '../types';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/../../.env' });

export class WebServer {
    private readonly app: Application;
    public server: http.Server | https.Server | undefined;

    public constructor(private readonly gameManager: GameManager, private readonly port: number, private readonly httpsPort: number) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.enable('trust proxy');

        this.app.use((request, response, next) => {
            // allow requests from web pages hosted anywhere
            const httpsEnabled = process.env["HTTPS_ENABLED"]!.toLowerCase();
            if(httpsEnabled === "yes" && !request.secure) { 
                return response.redirect("https://" + request.headers.host + request.url);
            }
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
                console.log(error);
                response
                    .status(HttpStatus.BAD_REQUEST)
                    .type('text')
                    .send('Config failed to parse');
            }
        });

        this.app.post('/watchSocket', (request, response) => {
            try {
                const { sessionID, socketID } = request.body;
                assert(sessionID && socketID);
                this.gameManager.registerSocket(sessionID, socketID);
                response
                    .status(HttpStatus.ACCEPTED)
                    .send();
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
                const data = this.gameManager.registerPlayer(socketID, sessionID, playerID);
                assert(data !== undefined);
                response
                    .status(HttpStatus.ACCEPTED)
                    .type('json')
                    .send(JSON.stringify({ token: data.token, announcement: { action: data.lastAction, serverTime: Date.now() } }));
            } catch (error) {
                if (error instanceof JoiningError) {
                    response
                        .status(HttpStatus.UNPROCESSABLE_ENTITY)
                        .type('text')
                        .send(error.getReason());
                } else {
                    response
                        .status(HttpStatus.BAD_REQUEST)
                        .type('text')
                        .send('Something went wrong');
                }
            }
        });
    }

    public start(): Promise<void> {
        return new Promise(resolve => {
            const httpsEnabled = process.env["HTTPS_ENABLED"]!.toLowerCase();
            if(httpsEnabled === "yes") {
                this.app.listen(this.port, () => {
                    console.log('server now listening at', this.port);
                });
                this.server = https.createServer({
                    key: fs.readFileSync(process.env["KEY"]!),
                    cert: fs.readFileSync(process.env["CERT"]!),
                    ca: fs.readFileSync(process.env["CA"]!),
                }, this.app).listen(this.httpsPort, () => {
                    console.log("server now listening at", this.httpsPort);
                    resolve();
                });
            } else {
                this.server = this.app.listen(this.port, () => {
                    console.log('server now listening at', this.port);
                    resolve();
                });
            }
        });
    }

    public stop(): void {
        this.server?.close();
        console.log('server stopped');
    }
}