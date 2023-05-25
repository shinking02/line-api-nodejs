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
const fs = require("fs");
const port = env.PORT || "";
const clientConfig: ClientConfig = config;
const middlewareConfig: MiddlewareConfig = config;
const client = new Client(clientConfig);
const app: Application = express();
const filePath = "message.txt";
const textCode = "utf8";

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
                    text: `/port: ポートを確認\n/help: コマンド一覧\n/get: セットされているテキストを確認`
                }
            }
            if(command === "port") {

                return {
                    type: "text",
                    text: `現在のポートは${port}です`
                }
            }
            if(command === "get") {

                return {
                    type: "text",
                    text: `現在のポートは${port}です`
                }
            }
            if(command === "get") {
                try {
                    const fileContent = fs.readFileSync(filePath, textCode);
                    return {
                        type: "text",
                        text: `[${fileContent}]がセットされています`
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
        return new Promise<TextMessage>((resolve, reject) => {
            fs.writeFile(filePath, text, textCode, (err: Error) => {
                if(err) {
                    console.error(err);
                    reject({
                        type: "text",
                        text: `[${text}]のセットに失敗しました`
                    });
                } else {
                    resolve({
                        type: "text",
                        text: `[${text}]をセットしました`
                    });
                }
            });
        });
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
    return res.status(200).send({
        message: fs.readFileSync(filePath, textCode)
    });
});

app.listen(port, () => {
    console.log(`server is listen on port ${port}`);
});