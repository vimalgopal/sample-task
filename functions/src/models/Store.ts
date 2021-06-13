import { Collection , IEntity } from 'fireorm';
import {getRepository} from './../utilities/database';

@Collection()
export class Store implements IEntity {
  id!: string;
  shop?: string;
  accessToken?: string | null;
  shopifyScopes: string = "";
  creationDate?: Date;
  webhooksVerifiedAt?: Date | null;
  disabled: boolean = false;

  public static getRepository() {
    return getRepository(Store);
  }

  public toString(): string {
    return `MerchantPartner Id: ${this.id}`;
  }

  public constructor(init?: Partial<Store>) {
    Object.assign(this, init);
  }

}


