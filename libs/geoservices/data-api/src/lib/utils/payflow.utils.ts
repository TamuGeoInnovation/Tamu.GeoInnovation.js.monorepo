export class NVPTransformer {
  public static serialize(obj: Record<string, string>): string {
    return Object.entries(obj)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  public static deserialize<T>(str: string): T {
    return str.split('&').reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      acc[key] = decodeURIComponent(value);

      return acc;
    }, {} as Record<string, string>) as unknown as T;
  }
}
