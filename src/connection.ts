import { ConnectionOptions, createConnection, getConnection, getRepository } from 'typeorm';

interface TypeOrmCli {
  entitiesDir: string,
  migrationsDir: string,
  subscribersDir: string
}

interface TypeOrmConfig {
    synchronize: boolean,
    logging: boolean,
    type: string,
    database: string,
    entities: string[],
    migrations: string[],
    subscribers: string[]
    cli: TypeOrmCli
}

interface TypeOrmEnvConfig {
  development: ConnectionOptions,
  test: ConnectionOptions
}

const developmentConfig: ConnectionOptions = {
  synchronize: true,
  logging: false,
  type: "sqlite",
  database: `development.sqlite`,
  entities: ["dist/entity/**/*.js"],
  migrations: [
    "dist/migration/**/*.js"
  ],
  subscribers: [
    "dist/subscriber/**/*.js"
  ],
  cli: {
    entitiesDir: "dist/entity",
    migrationsDir: "dist/migration",
    subscribersDir: "dist/subscriber"
  }
}

const testConfig: ConnectionOptions = {
  synchronize: true,
  logging: false,
  type: "sqlite",
  database: `test.sqlite`,
  entities: ["src/entity/**/*.ts"],
  migrations: [
    "src/migration/**/*.ts"
  ],
  subscribers: [
    "src/subscriber/**/*.ts"
  ],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
}

const connection = {
  async create(dbName: string = process.env.NODE_ENV) {
    const dbEnvConfig: TypeOrmEnvConfig = {
      development: developmentConfig,
      test: testConfig
    }

    if (dbName === "development") {
      await createConnection(dbEnvConfig.development)
    } else {
      await createConnection(dbEnvConfig.test)
    }
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
}

export default connection;
