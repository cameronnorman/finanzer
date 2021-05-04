import {
  ConnectionOptions,
  createConnection,
  getConnection,
  getRepository,
} from "typeorm"

interface TypeOrmCli {
  entitiesDir: string
  migrationsDir: string
  subscribersDir: string
}

interface TypeOrmConfig {
  synchronize: boolean
  logging: boolean
  type: string
  database: string
  entities: string[]
  migrations: string[]
  subscribers: string[]
  cli: TypeOrmCli
}

interface TypeOrmEnvConfig {
  test: ConnectionOptions
  development: ConnectionOptions
  production: ConnectionOptions
}

const productionConfig: ConnectionOptions = {
  synchronize: true,
  logging: false,
  type: "sqlite",
  database: `db/production.sqlite`,
  entities: ["dist/entity/**/*.js"],
  migrations: ["dist/migration/**/*.js"],
  subscribers: ["dist/subscriber/**/*.js"],
  cli: {
    entitiesDir: "dist/entity",
    migrationsDir: "dist/migration",
    subscribersDir: "dist/subscriber",
  },
}

const developmentConfig: ConnectionOptions = {
  synchronize: true,
  logging: false,
  type: "sqlite",
  database: `db/development.sqlite`,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
}

const testConfig: ConnectionOptions = {
  synchronize: true,
  logging: false,
  type: "sqlite",
  database: `db/test.sqlite`,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
}

const connection = {
  async create(dbName: string = process.env.NODE_ENV) {
    try {
      return getConnection("default")
    } catch (e) {
      const dbEnvConfig: TypeOrmEnvConfig = {
        production: productionConfig,
        development: developmentConfig,
        test: testConfig,
      }

      switch (dbName) {
        case "test":
          await createConnection(dbEnvConfig.test)
          break
        case "development":
          await createConnection(dbEnvConfig.development)
          break
        case "production":
          await createConnection(dbEnvConfig.production)
          break
        default:
          throw Error("Unable to identify database connection!")
      }
    }
  },

  async close() {
    await getConnection().close()
  },

  async clear() {
    const entities = getConnection().entityMetadatas

    entities.forEach(async (entity) => {
      const repository = getRepository(entity.name)
      await repository.query(`DELETE FROM ${entity.tableName}`)
    })
  },
}

export default connection
