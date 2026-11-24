const { toPublicUrl, toStoredImagePath, withPublicImages } = require("../../src/utils/publicUrl");

const req = { protocol: "http", get: () => "192.168.0.10:3000" };

describe("toPublicUrl", () => {
  it("completa caminho relativo com o host da requisição", () => {
    expect(toPublicUrl(req, "/images/a.png")).toBe("http://192.168.0.10:3000/images/a.png");
    expect(toPublicUrl(req, "images/a.png")).toBe("http://192.168.0.10:3000/images/a.png");
  });
  it("mantém URL absoluta e trata vazio", () => {
    expect(toPublicUrl(req, "https://cdn.com/a.png")).toBe("https://cdn.com/a.png");
    expect(toPublicUrl(req, null)).toBeNull();
    expect(toPublicUrl(req, "")).toBeNull();
  });
  it("withPublicImages troca só imageUrl", () => {
    expect(withPublicImages(req, { id: 1, imageUrl: "/images/a.png" })).toEqual({ id: 1, imageUrl: "http://192.168.0.10:3000/images/a.png" });
  });
});

describe("toStoredImagePath", () => {
  it("volta a URL desta API para caminho relativo", () => {
    expect(toStoredImagePath(req, "http://192.168.0.10:3000/images/a.png")).toBe("/images/a.png");
  });
  it("mantém URLs de outros hosts e valores não texto", () => {
    expect(toStoredImagePath(req, "https://cdn.com/a.png")).toBe("https://cdn.com/a.png");
    expect(toStoredImagePath(req, undefined)).toBeUndefined();
  });
});
