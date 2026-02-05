class ApiResponse<T = unknown> {
  public readonly success = true;

  constructor(
    public statusCode: number,
    public message: string,
    public data: T
  ) {}
}

export default ApiResponse;
