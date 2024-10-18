import { DeletTypes } from "../enums/enums";

export interface deleteConfig {
  id: number;
  itemName: string;
  toDelete: DeletTypes;
  title: string;
  text: string;
}

