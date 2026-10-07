import { createPasswordSchema, createProfileSchema } from './schemas';

const messages = {
  required: 'required',
  invalidEmail: 'email',
  tooShort: 'short',
  mismatch: 'mismatch',
};

function issues(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  return Object.fromEntries(
    (result.error?.issues ?? []).map((issue) => [issue.path[0], issue.message]),
  );
}

describe('profile schema', () => {
  const schema = createProfileSchema(messages);

  it('accepts a complete profile and trims it', () => {
    expect(schema.parse({ name: ' Ada ', email: 'ada@kega.cd', phone: '+243900000000' })).toEqual({
      name: 'Ada',
      email: 'ada@kega.cd',
      phone: '+243900000000',
    });
  });

  it('flags blank fields and a malformed email', () => {
    expect(issues(schema.safeParse({ name: '', email: 'nope', phone: '' }))).toEqual({
      name: 'required',
      email: 'email',
      phone: 'required',
    });
  });
});

describe('password schema', () => {
  const schema = createPasswordSchema(messages);

  it('accepts a long enough, confirmed password', () => {
    expect(
      schema.safeParse({
        current_password: 'old',
        password: 'n3w-secret',
        password_confirmation: 'n3w-secret',
      }).success,
    ).toBe(true);
  });

  it('requires 8 characters', () => {
    expect(
      issues(
        schema.safeParse({
          current_password: 'old',
          password: 'short',
          password_confirmation: 'short',
        }),
      ),
    ).toEqual({ password: 'short' });
  });

  it('reports a mismatch on the confirmation field', () => {
    expect(
      issues(
        schema.safeParse({
          current_password: 'old',
          password: 'n3w-secret',
          password_confirmation: 'other-one',
        }),
      ),
    ).toEqual({ password_confirmation: 'mismatch' });
  });
});
