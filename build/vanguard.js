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
exports.getFundById = void 0;
const axios_1 = __importDefault(require("axios"));
const VANGUARD_API_BASE_PATH = 'https://api.vanguard.com/rs/gre/gra/1.7.0/';
const DATASETS_PATH = 'datasets/urd-product-details.jsonp';
const axiosInst = axios_1.default.create({
    baseURL: VANGUARD_API_BASE_PATH,
});
exports.getFundById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let result = (yield axiosInst.get(DATASETS_PATH, {
        params: {
            path: `[id=${id}][0]`,
        },
    })).data;
    result = result.slice(9); // remove callback(
    result = result.substring(0, result.length - 1);
    const resultJson = JSON.parse(result);
    delete resultJson.documents;
    return resultJson;
});
