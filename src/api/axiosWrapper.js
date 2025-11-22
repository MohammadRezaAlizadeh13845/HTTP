import axios from "axios";

const axiosWrapper = async (url, options = {}, onProgress) => {
  try {
    const response = await axios({
      url,
      method: options.method || "GET",
      responseType: "blob",
      ...options,
      onDownloadProgress: (ProgressEvent) => {
        if (onProgress && ProgressEvent.total) {
          const percent = Math.round(
            (ProgressEvent.loaded * 100) / ProgressEvent.total
          );
          onProgress(percent);
        } else {
          onProgress((prev) => Math.min(prev + 5, 95));
        }
      },
    });

    const disposition = response.headers["content-disposition"];
    let filename = "downloaded-file";

    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/['"]/g, "").trim();
    } else {
      try {
        const urlParts = url.split("/");
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart) filename = decodeURIComponent(lastPart.split("?")[0]);
      } catch {
        filename = "downloaded-file";
      }
    }

    return {
      blob: response.data,
      filename: filename,
    };
  } catch (err) {
    if (!err.response) {
      const error = new Error("No internet");
      error.code = "network";
      throw error;
    }
    const status = err.response.status;
    if (status === 404) {
      const error = new Error("not_found");
      error.code = "not_found";
      throw error;
    }
    if (status >= 500) {
      const error = new Error("server_error");
      error.code = "Server error";
      throw error;
    }
    const error = new Error("Request failed.");
    error.code = "http_error";
    throw error;
  }
};

export default axiosWrapper;
