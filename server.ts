import express, { Application, Request, Response } from 'express';

const PORT = 8080;

const app: Application = express();

app.get('/', async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});