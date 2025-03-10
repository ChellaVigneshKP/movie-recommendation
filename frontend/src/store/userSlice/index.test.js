const userReducer = require('./index').default;
const { setEmail } = require('./index');

describe('userSlice Reducer', () => {
  it('should return the initial state', () => {
    const initialState = { email: '' };
    expect(userReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle setEmail action', () => {
    const previousState = { email: '' };
    const newState = userReducer(previousState, setEmail('test@example.com'));
    
    expect(newState.email).toBe('test@example.com');
  });
});
