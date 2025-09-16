import { conflict, internal, notFound } from '../../src/utils/errors';

describe('utils/errors', () => {
  it('constructs HttpErrors with correct status and message', () => {
    const e404 = notFound('X');
    expect(e404.status).toBe(404);
    expect(e404.message).toBe('X');

    const e409 = conflict('Y');
    expect(e409.status).toBe(409);
    expect(e409.message).toBe('Y');

    const e500 = internal();
    expect(e500.status).toBe(500);
    expect(e500.message).toBe('Internal Server Error');
  });
});

