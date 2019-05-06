const prod = process.env.NODE_ENV === 'production';

module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [prod ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [prod ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  cli: {
    migrationsDir: prod ? 'dist/migrations' : 'src/migrations',
  },
  synchronize: false,
};
