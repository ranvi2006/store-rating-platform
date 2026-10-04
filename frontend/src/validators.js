export const validateStore = f => {
  const e = {};
  if (f.name.trim().length < 20 || f.name.trim().length > 60)
    e.name = 'Name must be between 20 and 60 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address';
  if (f.address.length > 400) e.address = 'Address max 400 characters';
  return e;
};

export const validateUser = f => {
  const e = validateStore(f);
  if (!validatePassword(f.password)) e.password = '8-16 chars, one uppercase, one special character';
  return e;
};

export const validatePassword = p => /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(p);

export const errMsg = err =>
  err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Something went wrong';