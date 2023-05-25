import { ClientConfig, Client, middleware, MiddlewareConfig, WebhookEvent, TextMessage, MessageAPIResponseBase } from "@line/bot-sdk";
import express, { Application, Request, Response } from "express";
import { load } from "ts-dotenv";

const env = load({
    CHANNEL_ACCESS_TOKEN: String,
    CHANNEL_SECRET: String,
    PORT: Number,
    BUCKET_NAME: String
});
const config = {
    channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
    channelSecret: env.CHANNEL_SECRET || ""
};
const { Storage } = require('@google-cloud/storage');
const port = env.PORT || "";
const clientConfig: ClientConfig = config;
const middlewareConfig: MiddlewareConfig = config;
const client = new Client(clientConfig);
const app: Application = express();
const filePath = "message.txt";
const textCode = "utf8";
const storage = new Storage();
const bucket = storage.bucket(env.BUCKET_NAME);
const file = bucket.file(filePath);
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
    const { text } = event.message;
    const response = (async(): Promise<TextMessage> => {
        if(text.charAt(0) === "/") {
            const command = text.substring(1);
            if(command === "help") {
                return {
                    type: "text",
                    text: `/status: 状況を確認\n/help: コマンド一覧\n/get: セットされているテキストを確認`
                }
            }
            if(command === "status") {
                return {
                    type: "text",
                    text:  `バージョン: ${process.env.GAE_VERSION}\nデプロイID: ${process.env.GAE_DEPLOYMENT_ID}\nポート: ${process.env.PORT}`
                }
            }
            if(command === "get") {
                try {
                    const [content] = await file.download();
                    return {
                        type: "text",
                        text: `[${content}]がセットされています`
                    };
                } catch (err) {
                    console.error(err);
                    return {
                        type: "text",
                        text: `読み取りに失敗しました\n${err}`
                    };
                }
            }
            return {
                type: "text",
                text: `入力された開発コマンド、${command}は未実装です`
            }
        }
        try {
            await file.save(text, { contentType: textCode });
            return {
                type: "text",
                text: `[${text}]をセットしました`
            };
        } catch (err) {
            console.error(err);
            return {
                type: "text",
                text: `[${text}]のセットに失敗しました\n${err}`
            };
        }
    })();
    return await client.replyMessage(replyToken, await response);
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

app.get("/message", async(_req: Request, res: Response): Promise<Response> => {
    try {
        const [content] = await file.download();
        return res.status(200).send({
            message: content
        });
    } catch(err) {
        return res.status(200).send({
            message: err
        });
    }
    
});

app.listen(port, () => {
    console.log(`server is listen on port ${port}`);
});