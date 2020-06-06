import express from 'express';
import MongoClient from './mongo';
import {getFundById} from './vanguard';

import {format, createLogger, transports} from 'winston';

const round2dp = (number:number): number => {
  return Math.round((number+Number.EPSILON)*100)/100;
};

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console(),
    new transports.File({filename: 'error.log', level: 'error'}),
    new transports.File({filename: 'combined.log'}),
  ],
  format: format.combine(
      format.colorize(),
      format.json(),
  ),
});

const app = express();
const mongoClient = new MongoClient(logger);

app.get('/holdings', async (req, res)=>{
  logger.info('GET /holdings');
  const portfolio = await mongoClient.getHoldings();
  res.json(portfolio);
  logger.info('GET /holding resp sent');
});

app.get('/datasheet/:id', async (req, res)=>{
  logger.info('GET /datasheet/', req.params.id);
  const result = await getFundById(req.params.id, logger);
  res.send(result);
  logger.info('GET /datasheet resp sent');
});

app.get('/currentWorth', async (req, res)=>{
  logger.info('GET /currentWorth');
  const holdings = await mongoClient.getHoldings();
  const valueCache = await mongoClient.getValueCache();
  if (!valueCache) {
    logger.info('Cache expired. Getting fund values');
    if (!holdings) {
      throw Error('Holdings failed');
    }
    const fundValues = await Promise.all(holdings.map(async (fund)=>{
      const datasheet = await getFundById(fund.id, logger);
      const value = round2dp(Number(datasheet.navPrice.mmValue) * fund.units);
      return {
        ...fund,
        value,
      };
    }));
    logger.info('Fund Values returned');
    const totalWorth = round2dp(fundValues
        .reduce((worth, fund)=> worth+fund.value, 0));
    res.json({
      totalWorth,
      breakdown: fundValues,
    });
    await mongoClient.updateValueCache({totalWorth, funds: fundValues});
    logger.info('GET /currentWorth resp sent, cache updated');
  } else {
    res.json(valueCache);
    logger.info('GET /currentWorth resp sent');
  }
});

app.listen(5000);
