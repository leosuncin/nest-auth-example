import * as path from 'path';
import { type DataSource } from 'typeorm';
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver,
} from 'typeorm-fixtures-cli/dist';

export async function loadFixtures(
  dataSource: DataSource,
  fixturesPath = path.join(process.cwd(), 'test', 'fixtures'),
) {
  const loader = new Loader();
  loader.load(path.resolve(fixturesPath));

  const resolver = new Resolver();
  const parser = new Parser();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(dataSource, parser, false);

  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture);
    await dataSource.getRepository(fixture.entity).save(entity);
  }
}
