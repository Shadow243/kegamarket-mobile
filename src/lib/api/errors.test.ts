import { ApiError, errorMessage, formLevelError } from './errors';

describe('errorMessage', () => {
  it('uses the network wording when nothing reached the server', () => {
    expect(errorMessage(new ApiError('x', 0), 'fallback', 'offline')).toBe('offline');
  });

  it('uses the server message, else the fallback', () => {
    expect(errorMessage(new ApiError('Compte suspendu', 403), 'fallback', 'offline')).toBe(
      'Compte suspendu',
    );
    expect(errorMessage(new Error('boom'), 'fallback', 'offline')).toBe('fallback');
  });
});

describe('formLevelError', () => {
  it('stays silent when field errors are shown inline', () => {
    expect(formLevelError(new ApiError('Invalid', 422, { email: ['Taken'] }), 'f', 'n')).toBeNull();
  });

  it('surfaces errors that have no field to attach to', () => {
    expect(formLevelError(new ApiError('Server down', 500), 'f', 'n')).toBe('Server down');
    expect(formLevelError(null, 'f', 'n')).toBeNull();
  });
});
