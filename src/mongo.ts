import {MongoClient as MClient} from 'mongodb';
import winston from 'winston';

interface Fund {
  id: string,
  name: string,
  units: number
}

/**
 * Some JSDOC
 */
class MongoClient {
  logger: winston.Logger

  /**
   * Returns a mongoClient
   * @Param {winston.Logger} logger
   */
  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Some JSDOC
   * @param {string} db The db to connect to
   * @return {undefined}
   */
  connect = async (db = 'vanguard')=>{
    this.logger.debug('mongo connecting');
    return new MClient(`mongodb://localhost:27017/${db}`, {
      useUnifiedTopology: true,
    }).connect();
  };

  /**
   * @Param {MongoClient} client
   */
  disconnect = async (client: MClient)=>{
    this.logger.debug('mongo disconnecting');
    await client.close();
  }

  getHoldings = async (): Promise<Fund[]| undefined>=>{
    const client = await this.connect();
    this.logger.debug('mongo getting holdings');
    const result = (await client.db()
        .collection('holdings')
        .find()
        .toArray()).map((item)=>{
      delete item._id; return item;
    });
    this.logger.debug('holdings got');
    await this.disconnect(client);
    return result;
  }

  /**
   * @param {Portfolio} data
   */
  upsertHolding = async (data:Fund)=>{
    const client = await this.connect();
    this.logger.debug('mongo updating holdings');
    client.db().collection('holdings')
        .updateOne({id: data.id}, {$set: data});
    this.logger.debug('holdings updated');
    await this.disconnect(client);
    return;
  }
};

export default MongoClient;
