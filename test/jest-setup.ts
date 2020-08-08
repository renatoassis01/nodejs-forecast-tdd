import { SetupServer } from '@src/server';
import supertest from 'supertest';

beforeAll(() => {
  const setupServer = new SetupServer();
  setupServer.init();
  global.testRequest = supertest(setupServer.getApp());
});
