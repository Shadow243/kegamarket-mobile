import { createLoginSchema } from './login-schema';

describe('login schema', () => {
  const schema = createLoginSchema('Required');

  it('accepts an email or phone with a password', () => {
    expect(schema.safeParse({ login: '+243 900 000 000', password: 'secret' }).success).toBe(true);
  });

  it('rejects blank fields with the translated message', () => {
    const result = schema.safeParse({ login: '   ', password: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(['Required', 'Required']);
  });

  it('trims the identifier', () => {
    expect(schema.parse({ login: ' a@b.cd ', password: 'x' }).login).toBe('a@b.cd');
  });
});
