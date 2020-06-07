import {MongoClient as MClient} from 'mongodb';
import winston from 'winston';

import {Fund, Cache} from './types';


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

  getHoldings = async (): Promise<Fund[]>=>{
    const client = await this.connect();
    this.logger.debug('mongo getting holdings');
    const result = (await client.db()
        .collection('holdings')
        .find()
        .toArray()).map((item)=>{
      delete item._id; return item;
    });
    if (!result) {
      throw Error('Could not find holdings');
    }
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
  };

  getValueCache = async (): Promise<Cache | undefined> => {
    const client = await this.connect();
    this.logger.debug('getting current holdings value from cache');
    const cache = await client.db().collection('valueCache').findOne({});
    if (!cache) {
      this.logger.debug('cache miss (cache does not exist)');
      return undefined;
    }
    if (cache.timestamp < (Number(new Date()) - 1000 * 60 * 60 * 3) ) {
      // cache has expired (3h)
      this.logger.debug('cache miss (cache expired)');
      return undefined;
    }
    await this.disconnect(client);
    delete cache.unique;
    return cache;
  }

  clearValueCache = async () => {
    const client = await this.connect();
    this.logger.debug('clearing cache');
    await client.db().collection('valueCache').deleteOne({unique: '1'});
    await this.disconnect(client);
  }

  updateValueCache = async ({totalWorth, funds}: Cache)=>{
    const client = await this.connect();
    this.logger.debug('updating cached values');
    client.db().collection('valueCache')
        .updateOne(
            {unique: '1'},
            {
              $set: {
                totalWorth,
                funds,
                timestamp: new Date(),
                unique: '1',
              },
            },
            {upsert: true},
        );
  }
};

export default MongoClient;
