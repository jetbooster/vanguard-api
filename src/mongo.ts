import {MongoClient} from 'mongodb';

interface Fund {
  id: string,
  name: string,
  units: number
}

/**
 * Some JSDOC
 */
class Mongo {
  client: MongoClient|undefined;

  /**
   * Returns a mongoClient
   */
  constructor() {
    this.client = undefined;
  }

  /**
   * Some JSDOC
   * @param {string} db The db to connect to
   * @return {undefined}
   */
  connect = async (db = 'vanguard')=>{
    return new MongoClient(`mongodb://localhost:27017/${db}`, {
      useUnifiedTopology: true,
    }).connect();
  };

  /**
   * @Param {MongoClient} client
   */
  disconnect = async (client: MongoClient)=>{
    await client.close();
  }

  getHoldings = async (): Promise<Fund[]| undefined>=>{
    const client = await this.connect();
    const result = (await client.db()
        .collection('holdings')
        .find()
        .toArray()).map((item)=>{
      delete item._id; return item;
    });
    await this.disconnect(client);
    return result;
  }

  /**
   * @param {Portfolio} data
   */
  upsertHolding = async (data:Fund)=>{
    const client = await this.connect();
    client.db().collection('holdings')
        .updateOne({id: data.id}, {$set: data});
    await this.disconnect(client);
    return;
  }
};

export default Mongo;
