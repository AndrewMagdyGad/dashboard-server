import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataModule } from './Data/module';
import { HealthcheckController } from './Healthcheck/healthcheck.controller';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }),
    DataModule,
  ],
  controllers: [HealthcheckController],
})
export class AppModule {}
