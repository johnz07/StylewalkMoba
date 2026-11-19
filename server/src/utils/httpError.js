// Erro com status HTTP: lançado pelos services e convertido em resposta pelo errorHandler.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
