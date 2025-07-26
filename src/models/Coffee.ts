import Realm, { BSON } from 'realm';

export class Coffee extends Realm.Object<Coffee> {
  _id!: BSON.ObjectId;
  name!: string;
  roastery!: string;
  origin!: string;
  roastDate?: Date;
  brewMethod?: string;
  rating?: number;
  notes?: string;
  flavors: string[] = [];
  body?: number; // 1-5 scale
  acidity?: number; // 1-5 scale
  sweetness?: number; // 1-5 scale
  aftertaste?: number; // 1-5 scale
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Coffee',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      roastery: 'string',
      origin: 'string',
      roastDate: 'date?',
      brewMethod: 'string?',
      rating: 'double?',
      notes: 'string?',
      flavors: 'string[]',
      body: 'int?',
      acidity: 'int?',
      sweetness: 'int?',
      aftertaste: 'int?',
      createdAt: { type: 'date', default: () => new Date() },
      updatedAt: { type: 'date', default: () => new Date() },
  },
};
}

export class TastingSession extends Realm.Object<TastingSession> {
  _id!: BSON.ObjectId;
  coffeeId!: BSON.ObjectId;
  coffeeName!: string;
  roastery!: string;
  origin!: string;
  brewMethod?: string;
  waterTemperature?: number;
  grindSize?: string;
  brewTime?: number;
  flavors: string[] = [];
  body?: number;
  acidity?: number;
  sweetness?: number;
  aftertaste?: number;
  overallScore?: number;
  notes?: string;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'TastingSession',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      coffeeId: 'objectId',
      coffeeName: 'string',
      roastery: 'string',
      origin: 'string',
      brewMethod: 'string?',
      waterTemperature: 'double?',
      grindSize: 'string?',
      brewTime: 'double?',
      flavors: 'string[]',
      body: 'int?',
      acidity: 'int?',
      sweetness: 'int?',
      aftertaste: 'int?',
      overallScore: 'double?',
      notes: 'string?',
      createdAt: { type: 'date', default: () => new Date() },
  },
};
}