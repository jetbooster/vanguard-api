import express from 'express';
import Mongo from './mongo';
import {getFundById} from './vanguard';

import {format, transports} from 'winston';
import expressWinston from 'express-winston';

const app = express();
const mClient = new Mongo();

const expressLogger = expressWinston.logger({
  transports: [
    new transports.Console(),
    new transports.File({filename: 'error.log', level: 'error'}),
    new transports.File({filename: 'combined.log'}),
  ],
  format: format.combine(
      format.colorize(),
      format.json(),
  ),
  colorize: true,
});

app.use(expressLogger);

const round2dp = (number:number): number => {
  return Math.round((number+Number.EPSILON)*100)/100;
};

app.get('/holdings', async (req, res)=>{
  const portfolio = await mClient.getHoldings();
  res.json(portfolio);
});

app.get('/datasheet/:id', async (req, res)=>{
  const result = await getFundById(req.params.id);
  console.log(result);
  res.send(result);
});

app.get('/currentWorth', async (req, res)=>{
  const holdings = await mClient.getHoldings();
  if (!holdings) {
    throw Error('Holdings failed');
  }
  const fundValues = await Promise.all(holdings.map(async (fund)=>{
    const datasheet = await getFundById(fund.id);
    const value = round2dp(Number(datasheet.navPrice.mmValue) * fund.units);
    return {
      ...fund,
      value,
    };
  }));
  const totalWorth = round2dp(fundValues
      .reduce((worth, fund)=> worth+fund.value, 0));
  res.json({
    totalWorth,
    breakdown: fundValues,
  });
});

app.listen(5000);
