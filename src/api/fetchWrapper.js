const fetchData = async (url, onProgress) => {
  try {
    new URL(url);
  } catch {
    const error = new Error("Invalid link");
    error.code = "invalid_url";
    throw error;
  }

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    if (err instanceof TypeError) {
      const error = new Error("No internet connection");
      error.code = "network";
      throw error;
    }
    throw err;
  }

  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error("File not found");
      error.code = "not-found";
      throw error;
    }
    if (response.status >= 500) {
      const error = new Error("Server error.");
      error.code = "server-error";
      throw error;
    }
    const error = new Error(`HTTP error (${response.status})`);
    error.code = "http_error";
    throw error;
  }

  const contentType = response.headers.get("Content-Type");

  const contentDisposition = response.headers.get("Content-Disposition");

  let filename = null;

  if (contentDisposition && contentDisposition.includes("filename=")) {
    filename = contentDisposition
      .split("filename=")[1]
      .replace(/"/g, "")
      .trim();
  }

  if (!filename) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastSegment = pathname
      .substring(pathname.lastIndexOf("/") + 1)
      .split("?")[0];

    if (lastSegment.includes(".")) {
      filename = lastSegment;
    }
  }

  if (!filename && contentType) {
    const extension = contentType.split("/")[1] || "bin";
    filename = `downloaded-file.${extension}`;
  }

  if (!filename) filename = "downloaded-file.bin";

  if (
    contentType &&
    (contentType.includes("text/html") ||
      contentType.includes("application/json"))
  ) {
    const error = new Error("unsupported format");
    error.code = "bad_type";
    throw error;
  }

  const contentLength = response.headers.get("content-length");
  if (!contentLength) {
    const blob = await response.blob();
    return { blob, filename };
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;

    if (onProgress) {
      const percent = Math.round((loaded * 100) / total);
      onProgress(percent);
    }
  }

  const blob = new Blob(chunks, { type: contentType });
  return { blob, filename };
};

export default fetchData;

// The original code wrapped a fetch call inside a new Promise and manually used resolve and reject. Fetch itself already returns a promise, so this outer wrapper is largely redundant. The original wrapper allowed checking the response status and forcing a rejection if the HTTP status was not okay. That gave the developer full control over what counts as success or failure, and allowed transforming errors into a consistent shape before they reached the caller. However, you realized that throwing an error inside a .then() of fetch achieves the same effect, because throwing automatically rejects the promise returned by that .then(). Therefore, wrapping fetch inside a new Promise purely for error handling or returning JSON is unnecessary and can be removed.

// Fetch returns a promise immediately, and when you call response.json(), it also returns a promise because reading the response body and parsing JSON is asynchronous. That is why we needed a second .then(), because the first .then() only received the fetch response object, not the parsed JSON. The second .then() receives the resolved value of response.json() and gives us the actual data. This is why the data is more malleable in this scenario — the promise returned by response.json() allows us to asynchronously extract the JSON once the stream is fully read.

// We also discussed converting the function to async/await syntax. The async keyword marks the function as asynchronous, meaning it always returns a promise, and await pauses the execution of that function until the awaited promise settles, without blocking the main thread. If the awaited promise resolves, it returns the value, and if it rejects, it throws an error inside the async function. This allows writing asynchronous code that looks synchronous, linear, and more readable. We noted that if there is no try/catch and the awaited promise rejects, the async function stops execution immediately, the code after the await does not run, and the function returns a rejected promise containing the error. This rejected promise does nothing on its own unless the caller handles it with .catch() or try/catch.

// Finally, we concluded that the async/await version is cleaner and preferred for readability, while the fetch with .then() chaining works identically in terms of behavior. The outer promise wrapper around fetch was unnecessary because throwing errors inside .then() or using await already propagates rejection correctly, and returning the JSON promise allows the caller to work with actual data. Using async/await simplifies this further, making the code easier to read and maintain, while keeping the same underlying behavior regarding resolution and rejection of promises.

// response.body.getReader() gives a reader that acts like a cursor over the response body, letting us read the data in chunks. Each call to reader.read() returns an object with done and value, where value is the next chunk of bytes and done indicates whether the download is complete. By accumulating the bytes received in loaded and using content-length from the headers as total, we can calculate the download percentage and pass it to an onProgress callback to update the UI in real time. This loop continues asynchronously until the file is fully downloaded. If content-length is missing, we fall back to response.blob(), which returns the full Blob at the end but doesn’t allow real-time progress updates. The fetch request runs once, but reading the chunks happens repeatedly, and each chunk arrival triggers the progress calculation and UI update.
