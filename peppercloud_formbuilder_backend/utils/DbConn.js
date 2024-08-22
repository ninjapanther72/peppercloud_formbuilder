const {MongoClient, Db} = require('mongodb');
const {printError, printLog} = require("./ServerUtils");

const DB_CON_OPTIONS = {
    conUrlString: process.env.MONGO_DB_CON_URL,
    dbName: process.env.MONGO_DB_NAME,
};

/**
 * Create a new connection to the pepper-cloud-form-builder database.
 * @return {Promise<{client: MongoClient, db: Db}>} Returns a promise that resolves to an object containing
 *  an instance of {@link MongoClient} as "client", and an instance of {@link Db} as "db".
 */
async function getMongoDbCon() {
    const fun = 'getMongoDbCon:';
    try {
        const client = new MongoClient(DB_CON_OPTIONS.conUrlString);
        await client.connect();
        const db = client.db(DB_CON_OPTIONS.dbName);
        printLog(fun, 'Connected to database');
        return {client, db};
    } catch (error) {
        printError(fun, 'Error connecting to database:', error);
        return {};
    }
}

module.exports = {
    getMongoDbCon,
    DB_CON_OPTIONS,
};
