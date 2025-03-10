import { describe, it, expect } from 'vitest';
import userReducer, { setEmail } from './index';

describe("userSlice reducer", () => {
  it("should return the initial state", () => {
    expect(userReducer(undefined, { type: undefined })).toEqual({
      email: "",
    });
  });

  it("should handle setEmail action", () => {
    const previousState = { email: "" };
    const newState = userReducer(previousState, setEmail("test@example.com"));

    expect(newState).toEqual({ email: "test@example.com" });
  });
});