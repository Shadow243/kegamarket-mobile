import { createAddressSchema } from './address-schema';

const schema = createAddressSchema({ required: 'required', invalidEmail: 'email' });

const valid = {
  recipient_name: 'Ada Lovelace',
  recipient_phone: '+243 900 000 000',
  recipient_email: 'ada@kega.cd',
  delivery_city: 'Kinshasa',
  delivery_commune: '',
  delivery_address_line: '12 av. de la Paix, Gombe',
};

describe('address schema', () => {
  it('accepts a full address with an optional commune', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('requires the fields the API requires', () => {
    const result = schema.safeParse({
      ...valid,
      recipient_name: ' ',
      delivery_city: '',
      delivery_address_line: '',
    });

    expect(result.error?.issues.map((issue) => issue.path[0]).sort()).toEqual([
      'delivery_address_line',
      'delivery_city',
      'recipient_name',
    ]);
  });

  it('rejects a malformed email', () => {
    expect(schema.safeParse({ ...valid, recipient_email: 'ada' }).error?.issues[0].message).toBe(
      'email',
    );
  });
});
