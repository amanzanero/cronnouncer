/*
 * This file contains a class that wraps args with different functions for dynamic usage
 */

export class Args {
  private readonly rawArgs: string;

  constructor(raw: string) {
    this.rawArgs = raw;
  }

  get raw() {
    return this.rawArgs;
  }

  get argArray() {
    return this.rawArgs.split(" ");
  }
}
