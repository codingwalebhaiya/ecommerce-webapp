class ApiResponse<T = unknown> {
  public readonly success = true;

  constructor(
    public statusCode: number,
    public message: string,
    public data: T
  ) {}
}

export default ApiResponse;


// success response

// {
//   "success": true,
//   "message": "User created successfully",
//   "data": {
//     "id": 1,
//     "name": "John Doe",
//     "email": "john.doe@example.com"
//   }
// }

// error response 

// {
//   "success": false,
//   "message": "Invalid credentials"
// }
