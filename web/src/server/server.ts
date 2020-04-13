import { Client } from 'colyseus.js';

export const buildServer = () => new Client('ws://localhost:3001');
