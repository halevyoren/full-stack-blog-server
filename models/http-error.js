class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // add a "message" property (for the parent (the Error))
    this.code = errorCode; // add a "code" property
  }
}

module.exports = HttpError;
