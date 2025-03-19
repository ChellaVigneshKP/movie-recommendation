import { describe, it, expect } from "vitest";
import axios from "axios";
import getInstance from "@/utils/axios"; // Update path based on your project structure

describe("getInstance", () => {
  it("should return an Axios instance with the correct base URL", () => {
    const instance = getInstance();

    expect(instance.defaults.baseURL).toBe("https://api.themoviedb.org/3");
  });

  it("should create a new instance separate from the default Axios instance", () => {
    const instance = getInstance();

    // Check that the created instance is different from the global axios instance
    expect(instance).not.toBe(axios);
  });

  it("should allow adding custom headers dynamically", () => {
    const instance = getInstance();

    instance.defaults.headers.common["Authorization"] = "Bearer test_token";

    expect(instance.defaults.headers.common["Authorization"]).toBe(
      "Bearer test_token"
    );
  });
});
