import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

class DBConnect {
  protected pool: Pool;
  protected client!: PoolClient;
  protected result!: any[];
  constructor() {
    dotenv.config();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  async connectDB() {
    this.client = await this.pool.connect();
    return this;
  }
  async startTransaction() {
    return await this.client
      .query("BEGIN")
      .then(() => this)
      .catch(() => this.rollBackTransaction());
  }
  async endTransaction() {
    return await this.client
      .query("COMMIT")
      .then(() => {
        this.disconnectDB();
      })
      .catch(async (error) => {
        console.log(error);
        (await this.rollBackTransaction()).disconnectDB();
      });
  }
  async rollBackTransaction(rollback: string = "ROLLBACK") {
    await this.client.query(rollback);
    return this;
  }
  async queryScript(text: string) {
    return await this.client.query(text).then((res) => {
      this.result = res.rows;
      return this;
    }).catch((error) => { console.log(error); return this});
  }
  disconnectDB() {
    return this.client.release();
  }
  getResult() {
    return this.result;
  }
}
export default DBConnect;
