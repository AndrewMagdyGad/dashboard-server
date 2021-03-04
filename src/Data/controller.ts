import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpException,
  Delete,
  Param,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Request } from 'express';
import { GetDataParams } from './interface';
import { DataService } from './service';
import { getDataSchema, MongodbId, UpdateGoalValuePayload } from './validators';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get()
  getData(@Req() req: Request) {
    const { error } = getDataSchema.validate(req.query);
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } else {
      const params: GetDataParams = {
        page: Number(req.query.page),
        itemsPerPage: Number(req.query.itemsPerPage),
        search: req.query.search ? String(req.query.search) : undefined,
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        desc: req.query.desc
          ? req.query.desc === 'true'
            ? true
            : false
          : undefined,
      };
      return this.dataService.getData(params);
    }
  }

  @Put(':id')
  updateGoalValue(
    @Param() params: MongodbId,
    @Body() payload: UpdateGoalValuePayload,
  ) {
    return this.dataService.updateGoalValue({
      id: params.id,
      goalValue: payload.goalValue,
    });
  }

  @Delete('delete-all')
  deleteAll() {
    return this.dataService.deleteAll();
  }

  @Delete(':id')
  deleteById(@Param() params: MongodbId) {
    return this.dataService.deleteById(params.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (file && file.mimetype === 'text/csv') {
      return this.dataService.importData(file);
    } else {
      throw new HttpException(
        'The file field is empty or incompatible file extension, we only support csv files',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
