export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(message = 'Not Found') {
  return new HttpError(404, message);
}

export function badRequest(message = 'Bad Request') {
  return new HttpError(400, message);
}

export function conflict(message = 'Conflict') {
  return new HttpError(409, message);
}

export function internal(message = 'Internal Server Error') {
  return new HttpError(500, message);
}

