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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
/**
 * Some JSDOC
 */
class Mongo {
    /**
     * Returns a mongoClient
     */
    constructor() {
        /**
         * Some JSDOC
         * @param {string} db The db to connect to
         * @return {undefined}
         */
        this.connect = (db = 'vanguard') => __awaiter(this, void 0, void 0, function* () {
            this.client = yield new mongodb_1.MongoClient(`mongodb://localhost:27017/${db}`, {
                useUnifiedTopology: true,
            }).connect();
        });
        this.disconnect = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield ((_a = this.client) === null || _a === void 0 ? void 0 : _a.close());
            this.client = undefined;
        });
        this.getHoldings = () => __awaiter(this, void 0, void 0, function* () {
            var _b;
            yield this.connect();
            const result = yield ((_b = this.client) === null || _b === void 0 ? void 0 : _b.db().collection('holdings').find().toArray());
            yield this.disconnect();
            return result;
        });
        /**
         * @param {Portfolio} data
         */
        this.upsertHolding = (data) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            yield this.connect();
            (_c = this.client) === null || _c === void 0 ? void 0 : _c.db().collection('holdings').updateOne({ id: data.id }, { $set: data });
            yield this.disconnect();
            return;
        });
        this.client = undefined;
    }
}
;
exports.default = Mongo;
