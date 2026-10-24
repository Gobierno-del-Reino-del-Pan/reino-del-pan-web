import 'dotenv/config';
import express from 'express';
import {createBetPanRouter} from './router.mjs';
const app=express();app.use(express.json({limit:'40kb'}));
// Solo pruebas del router, sesión Discord debe venir de la aplicación principal.
app.use('/api/betpan',createBetPanRouter());
app.listen(3001,()=>console.log('BetPan API en http://localhost:3001/api/betpan (requiere sesión Discord real)'));
