import { ClientConfig, Client, middleware, MiddlewareConfig, WebhookEvent, TextMessage, MessageAPIResponseBase } from "@line/bot-sdk";
import express, { Application, Request, Response } from "express";
import { load } from "ts-dotenv";

const env = load({
    CHANNEL_ACCESS_TOKEN: String,
    CHANNEL_SECRET: String,
    PORT: Number
});
const config = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
    channelSecret: env.CHANNEL_SECRET || ""
};
const port = env.PORT || "";
const clientConfig: ClientConfig = config;
const middlewareConfig: MiddlewareConfig = config;
const client = new Client(clientConfig);
const app: Application = express();

app.get("/", async(_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
        message: "success"
    });
});

const textEventHandler = async(event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
    if(event.type !== "message" || event.message.type !== "text") {
        return;
    }
    const { replyToken } = event;
    const response = ((): TextMessage => {
        const { text } = event.message;
        if(text.charAt(0) === "/") {
            const command = text.substring(1);
            return {
                type: "text",
                text: `入力された開発コマンド、${command}は未実装です`
            }
        }
        return {
            type: "text",
            text: `[${text}]がセットされました`
        }
    })();
    return await client.replyMessage(replyToken, response);
};

app.post("/webhook", middleware(middlewareConfig), async(req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(events.map(async(event: WebhookEvent) => {
        try {
            await textEventHandler(event);
        } catch(e: unknown) {
            if(e instanceof Error) {
                console.error(e);
            }
            return res.status(500).send();
        }
    }));
    return res.status(200).send();
});

app.listen(port, () => {
    console.log(`server is listen on port ${port}`);
});