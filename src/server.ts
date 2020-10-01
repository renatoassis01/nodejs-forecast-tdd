import { ForecastController } from '@controllers/forecast';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import * as database from './database';
import './utils/module-alias';

export class SetupServer extends Server {
  constructor(private port: number = 3000) {
    super();
    this.init();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();

  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private async setupDatabase(): Promise<void> {
    await database.connect()
  }

  public async close(): Promise<void> {
    await database.close()
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers(forecastController);
  }


}
//https://www.youtube.com/watch?v=-KtwIhvj--g