/**
 * This contains the expected value from the use case layer
 */

interface ResponseProps<T> {
  value?: T;
  message?: string;
  failed: boolean;
}

export class Response<T> {
  public readonly value: T | undefined;
  public readonly message: string | undefined;
  public readonly failed: boolean;

  constructor(props: ResponseProps<T>) {
    this.value = props.value;
    this.message = props.message;
    this.failed = props.failed;
  }

  public static success<U>(value?: U) {
    return new Response<U>({ failed: false, value });
  }

  public static fail<U>(value?: U) {
    return new Response<U>({ failed: true, value });
  }
}

export type UseCaseExecute<T, U> = (inputDTO: T) => Promise<Response<U>>;
