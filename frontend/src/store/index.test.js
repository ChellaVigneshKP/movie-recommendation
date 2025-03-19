import { describe, it, expect } from "vitest";
import { store } from "./index";
import { setEmail } from "./userSlice";

describe("Redux Store", () => {
  it("should have user reducer", () => {
    const state = store.getState();
    expect(state).toHaveProperty("user");
  });

  it("should update user email when setEmail is dispatched", () => {
    const testEmail = "test@example.com";

    store.dispatch(setEmail(testEmail));

    const state = store.getState();
    expect(state.user.email).toBe(testEmail)
  });
});
