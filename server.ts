import express, { Application, Request, Response } from 'express';
import { load } from 'ts-dotenv';
const PORT = 8080;

const app: Application = express();
const a = process.env.BUCKET_NAME;
app.get('/', async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
    BUCKET_NAME: a
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});