import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataController } from './controller';
import { DataService } from './service';
import { DataSchema } from './schema';

@Module({
  imports: [
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
})
export class DataModule {}
