"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const connection = {
    async create() {
        await typeorm_1.createConnection({
            "synchronize": true,
            "logging": false,
            "type": "sqlite",
            "database": "db.sqlite",
            "entities": ["src/entity/**/*.js"],
            "migrations": [
                "src/migration/**/*.js"
            ],
            "subscribers": [
                "src/subscriber/**/*.js"
            ],
            "cli": {
                "entitiesDir": "src/entity",
                "migrationsDir": "src/migration",
                "subscribersDir": "src/subscriber"
            }
        });
    },
    async close() {
        await typeorm_1.getConnection().close();
    },
    async clear() {
        const entities = typeorm_1.getConnection().entityMetadatas;
        entities.forEach(async (entity) => {
            const repository = typeorm_1.getRepository(entity.name);
            await repository.query(`DELETE FROM ${entity.tableName}`);
        });
    },
};
exports.default = connection;
//# sourceMappingURL=connection.js.map