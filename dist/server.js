"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PORT = 3000;
const app = (0, express_1.default)();
app.get('/', async (_, res) => {
    return res.status(200).send({
        message: 'Hello World!',
    });
});
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
});
