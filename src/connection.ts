import { createConnection, getConnection, getRepository } from 'typeorm';

const connection = {
  async create(dbName: string = process.env.NODE_ENV){
    await createConnection({
      "synchronize": true,
      "logging": false,
      "type": "sqlite",
      "database": `${dbName}.sqlite`,
      "entities": ["src/entity/**/*.ts"],
      "migrations": [
        "src/migration/**/*.ts"
      ],
      "subscribers": [
        "src/subscriber/**/*.ts"
      ],
      "cli": {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
      }
    })
  },

  async close(){
    await getConnection().close()
  },

  async clear(){
    const entities = getConnection().entityMetadatas;

    entities.forEach(async (entity) => {
      const repository = getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    });
  },
};

export default connection;
