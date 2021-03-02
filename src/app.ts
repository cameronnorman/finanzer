import express from "express"
import morgan from "morgan"
import dotenv from "dotenv";
import connection from "./connection"
import transactionsRouter from "./routes/transactions";
import profilesRouter from "./routes/profiles";
import healthCheckRouter from "./routes/health_check";

dotenv.config();

const app: express.Application = express()
const port: string = process.env.PORT

app.use(express.json());
app.use(morgan('tiny'));
app.use('/', transactionsRouter)
app.use('/', profilesRouter)
app.use('/', healthCheckRouter)

const server = app.listen(port, () => {
  connection.create(process.env.NODE_ENV)
  // tslint:disable-next-line:no-console
  console.log(`Server started on port: ${ port }`);
});

export default server
