import express, { Application, Request, Response } from 'express';
import { load } from 'ts-dotenv';

const app: Application = express();
const env = load({
  PORT: Number
})
app.get('/', async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!'
  });
});
app.get('/message', async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'HTTPS'
  });
});

app.listen(env.PORT, () => {
});