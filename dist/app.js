"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = __importDefault(require("./connection"));
const typeorm_1 = require("typeorm");
const Transaction_1 = require("./entity/Transaction");
dotenv_1.default.config();
const app = express_1.default();
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(morgan_1.default('tiny'));
// Health check for server
app.get("/check", (req, res) => {
    res.send("OK");
});
app.get("/transactions", (req, res) => {
    // const transactionRepository = getRepository(Transaction)
    // transactionRepository.find({})
    // .then((transactions: Transaction[]) => {
    // res.status(200).json(transactions)
    // })
    res.status(200).json({});
});
app.post("/transactions", (req, res) => {
    const transactionRepository = typeorm_1.getRepository(Transaction_1.Transaction);
    transactionRepository.save(req.body)
        .then((transaction) => {
        res.json(transaction);
    });
});
const server = app.listen(port, () => {
    connection_1.default.create();
    // tslint:disable-next-line:no-console
    console.log(`Server started on port: ${port}`);
});
exports.default = server;
//# sourceMappingURL=app.js.map