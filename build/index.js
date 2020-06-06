"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongo_1 = __importDefault(require("./mongo"));
const vanguard_1 = require("./vanguard");
const app = express_1.default();
const mClient = new mongo_1.default();
const round2dp = (number) => {
    return Math.round((number + Number.EPSILON) * 100) / 100;
};
app.get('/holdings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const portfolio = yield mClient.getHoldings();
    res.json(portfolio);
}));
app.get('/datasheet/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vanguard_1.getFundById(req.params.id);
    console.log(result);
    res.send(result);
}));
app.get('/currentWorth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const holdings = yield mClient.getHoldings();
    if (!holdings) {
        throw Error('Holdings failed');
    }
    const fundValues = yield Promise.all(holdings.map((fund) => __awaiter(void 0, void 0, void 0, function* () {
        const datasheet = yield vanguard_1.getFundById(fund.id);
        const value = round2dp(Number(datasheet.navPrice.mmValue) * fund.units);
        return Object.assign(Object.assign({}, fund), { value });
    })));
    console.log(fundValues);
    const totalWorth = round2dp(fundValues
        .reduce((worth, fund) => worth + fund.value, 0));
    res.json({
        totalWorth,
        breakdown: fundValues,
    });
}));
app.listen(5000);
