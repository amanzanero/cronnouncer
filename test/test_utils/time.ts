export async function timeout(ms: number, callback: (...a: any) => any): Promise<void> {
  return await new Promise((resolve) =>
    setTimeout(() => {
      callback();
      resolve();
    }, ms),
  );
}
