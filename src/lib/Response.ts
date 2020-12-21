/**
 * This contains the expected value from the use case layer
 */

interface ResponseProps<T> {
  dto?: T;
  message?: string;
  failed: boolean;
}

export class Response<T> {
  public readonly dto: T | undefined;
  public readonly message: string | undefined;
  public readonly failed: boolean;

  constructor(props: ResponseProps<T>) {
    this.dto = props.dto;
    this.message = props.message;
    this.failed = props.failed;
  }

  public static success<U>(dto: U) {
    return new Response<U>({ failed: false, dto });
  }

  public static fail<U>(message?: string) {
    return new Response<U>({ failed: true, message });
  }
}
