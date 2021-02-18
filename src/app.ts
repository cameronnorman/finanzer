import express from "express"
import morgan from "morgan"
import dotenv from "dotenv";
import connection from "./connection"
import { getRepository, InsertResult } from "typeorm";
import { Transaction } from "./entity/Transaction";

dotenv.config();

const app: express.Application = express()
const port: string = process.env.PORT

app.use(express.json());
app.use(morgan('tiny'));

// Health check for server
app.get("/check", ( req: express.Request, res: express.Response ) => {
  res.send("OK");
});

app.get("/transactions", (req: express.Request, res: express.Response) => {
   const transactionRepository = getRepository(Transaction)

    transactionRepository.find({})
     .then((transactions: Transaction[]) => {
       res.status(200).json(transactions)
     })
});

app.post("/transactions", (req: express.Request, res: express.Response) => {
  const transactionRepository = getRepository(Transaction)

  transactionRepository.save(req.body)
    .then((transaction: Transaction) => {
      res.json(transaction)
    })
});

const server = app.listen(port, () => {
  connection.create(process.env.NODE_ENV)
  // tslint:disable-next-line:no-console
  console.log(`Server started on port: ${ port }`);
});

export default server
