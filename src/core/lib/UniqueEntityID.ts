import { v4 } from "uuid";

export class UniqueEntityID {
  public readonly value: string;

  constructor(id?: string) {
    this.value = id ? id : v4();
  }
}
