// AsyncStorage em memória: os testes não dependem do armazenamento nativo.
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
