import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataDocument, GetDataParams } from './interface';
import * as XLSX from 'xlsx';
import { rowDataSchema } from './validators';

@Injectable()
export class DataService {
  constructor(
    @InjectModel('Data')
    private readonly dataModel: Model<DataDocument>,
  ) {}

  /**
   * list data with pagination, search and sorting
   * @param GetDataParams object
   */
  getData = async ({
    page,
    itemsPerPage,
    search,
    sortBy,
    desc,
  }: GetDataParams) => {
    try {
      let findQuery = {};
      if (search) {
        // check if the search is a text or a number
        if (!search.match(/^-?\d*\.?\d*$/)) {
          const regex = new RegExp(search, 'i');
          findQuery = {
            $or: [{ source: regex }, { avgSessionDuration: regex }],
          };
        } else {
          findQuery = {
            $or: [
              { users: Number(search) },
              { newUsers: Number(search) },
              { sessions: Number(search) },
              { bounceRate: Number(search) },
              { firstSeenOn: Number(search) },
              { pagesPerSession: Number(search) },
              { conversionRate: Number(search) },
              { goalValue: Number(search) },
            ],
          };
        }
      }

      // -1 means descending
      const sortQuery = sortBy ? [[sortBy, desc ? -1 : 1]] : [['createdAt', 1]];

      const count = await this.dataModel.countDocuments(findQuery);
      const result = await this.dataModel
        .find(findQuery)
        .sort(sortQuery)
        .limit(itemsPerPage)
        .skip(itemsPerPage * page);

      return { result, count };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };

  /**
   * update a data document with a new goal value
   * @param id of data document
   * @param goalValue to be updated
   */
  updateGoalValue = async ({ id, goalValue }) => {
    const dataDocument = await this.dataModel.findById(id);
    if (!dataDocument) {
      throw new HttpException(
        `There is no document with this id: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dataModel
      .findByIdAndUpdate(id, { goalValue }, { new: true })
      .catch(e => {
        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  };

  /**
   * drop the data collection
   */
  deleteAll = async () => {
    return this.dataModel.collection.drop().catch(e => {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
  };

  /**
   * delete a data document
   * @param id of data document to be deleted
   */
  deleteById = async (id: string) => {
    const dataDocument = await this.dataModel.findById(id);
    if (!dataDocument) {
      throw new HttpException(
        `There is no document with this id: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dataModel.findByIdAndDelete(id).catch(e => {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    });
  };

  /**
   * import data from csv file to our db
   * @param file
   */
  importData = async (file: Express.Multer.File) => {
    try {
      const workbook = XLSX.read(file.buffer, {
        type: 'buffer',
        cellDates: true,
      });
      const sheetNames = workbook.SheetNames;
      const worksheet = workbook.Sheets[sheetNames[0]];
      const documentArray = [];
      let failedToImport = 0;

      for (let cell in worksheet) {
        if (cell.toString()[0] === 'A') {
          const cellNumber = Number(cell.toString().substring(1));
          if (cellNumber > 1) {
            const rowData = {
              source: worksheet['A' + cellNumber]?.v,
              users: worksheet['B' + cellNumber]?.v,
              newUsers: worksheet['C' + cellNumber]?.v,
              sessions: worksheet['D' + cellNumber]?.v,
              bounceRate: worksheet['E' + cellNumber]?.v,
              firstSeenOn: worksheet['F' + cellNumber]?.v,
              pagesPerSession: worksheet['G' + cellNumber]?.v,
              avgSessionDuration: worksheet['H' + cellNumber]?.v,
              conversionRate: worksheet['I' + cellNumber]?.v,
              goalValue: worksheet['J' + cellNumber]?.v,
            };

            const { error } = rowDataSchema.validate(rowData);

            if (!error) {
              rowData.bounceRate = (rowData.bounceRate * 100).toFixed(2);
              rowData.conversionRate = (rowData.conversionRate * 100).toFixed(
                2,
              );
              documentArray.push(rowData);
            } else {
              failedToImport++;
            }
          }
        }
      }
      const res = await this.dataModel.insertMany(documentArray);
      return {
        message: `${res.length} rows are imported successfully, and ${failedToImport} rows are failed to be imported`,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}
