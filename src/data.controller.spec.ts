import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './Data/controller';
import { DataService } from './Data/service';
import { DataSchema } from './Data/schema';
import * as request from 'supertest';
import { closeInMongodConnection, rootMongooseTestModule } from './test-utils';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpStatus, INestApplication } from '@nestjs/common';

describe('DataController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {
            name: 'Data',
            schema: DataSchema,
            collection: 'data',
          },
        ]),
      ],
      controllers: [DataController],
      providers: [DataService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('app should be defined', () => {
    expect(app).toBeDefined();
  });

  it('GET Data with pagination', async () => {
    return request(app.getHttpServer())
      .get('/data?page=1&itemsPerPage=10')
      .expect(HttpStatus.OK);
  });

  it('invalid query params, should throw error', async () => {
    return request(app.getHttpServer())
      .get('/data?page=1&itemsPerPage=')
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('update a goal value with an invlaid id', async () => {
    const body = { goalValue: 10.2 };
    const res = await request(app.getHttpServer())
      .put('/data/5ead5c1a43ace404e06a7408')
      .set('Accept', 'application/json')
      .send(body);
    const parseRes = JSON.parse(res.text);

    return expect(parseRes.message).toEqual(
      'There is no document with this id: 5ead5c1a43ace404e06a7408',
    );
  });

  afterAll(async done => {
    await closeInMongodConnection();
    await app.close();
    done();
  });
});
