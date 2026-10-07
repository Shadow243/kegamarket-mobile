import {
  createForgotPasswordSchema,
  createRegisterSchema,
  type RegisterForm,
} from './register-schema';

const messages = {
  required: 'required',
  invalidEmail: 'invalidEmail',
  tooShort: 'tooShort',
  mismatch: 'mismatch',
  mustAcceptTerms: 'mustAcceptTerms',
};

const valid: RegisterForm = {
  account_type: 'particulier',
  name: 'Mama Nzinga',
  phone: '+243810000000',
  email: 'mama@example.com',
  password: 'secret123',
  password_confirmation: 'secret123',
  terms_accepted: true,
};

function errorsOf(values: Partial<RegisterForm>) {
  const result = createRegisterSchema(messages).safeParse({ ...valid, ...values });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('createRegisterSchema', () => {
  it('accepts a complete form', () => {
    expect(errorsOf({})).toEqual([]);
  });

  it('requires the terms to be accepted', () => {
    expect(errorsOf({ terms_accepted: false })).toEqual(['mustAcceptTerms']);
  });

  it('rejects a short or mismatched password', () => {
    expect(errorsOf({ password: 'short', password_confirmation: 'short' })).toEqual(['tooShort']);
    expect(errorsOf({ password_confirmation: 'different1' })).toEqual(['mismatch']);
  });

  it('rejects an invalid email and empty name', () => {
    expect(errorsOf({ email: 'not-an-email', name: ' ' })).toEqual(['required', 'invalidEmail']);
  });
});

describe('createForgotPasswordSchema', () => {
  it('requires a valid email', () => {
    const schema = createForgotPasswordSchema(messages);
    expect(schema.safeParse({ email: 'mama@example.com' }).success).toBe(true);
    expect(schema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
