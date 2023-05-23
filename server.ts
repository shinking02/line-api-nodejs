import express, { Application, Request, Response } from 'express';
import { load } from 'ts-dotenv';
const PORT = 8080;

const app: Application = express();
const a = load({
    BUCKET_NAME: String,
});
app.get('/', async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
    BUCKET_NAME: a.BUCKET_NAME
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});