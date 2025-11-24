import { useState, useRef } from "react";
import Fetch from "../api/fetchWrapper";
import Axios from "../api/axiosWrapper";

const Promis2 = () => {
  const [fetchProgress, setFetchProgress] = useState(0);

  const [axiosProgress, setAxiosProgress] = useState(0);

  const [fetchButtonText, setFetchButtonText] = useState("Download");

  const [axiosButtonText, setAxiosButtonText] = useState("Download");

  const [fetchLink, setFetchLink] = useState("");

  const [axiosLink, setAxiosLink] = useState("");

  const fetchLinkInputRef = useRef(null);

  const axiosLinkInputRef = useRef(null);

  const [fetchErrorText, setFetchErrorText] = useState("");

  const [axiosErrorText, setAxiosErrorText] = useState("");

  const [fetchShowProgress, setFetchShowProgress] = useState(false);

  const [axiosShowProgress, setAxiosShowProgress] = useState(false);

  const [fetchShowError, setFetchShowError] = useState(false);

  const [axiosShowError, setAxiosShowError] = useState(false);

  const [fetchDotCount, setFetchDotCount] = useState(0);

  const [axiosDotCount, setAxiosDotCount] = useState(0);

  const fetchDownloadButton = async () => {
    const url = fetchLinkInputRef.current.value;

    if (!url) return;

    setFetchShowError(false);
    setFetchShowProgress(true);
    setFetchProgress(0);

    setFetchButtonText("Downloading");
    setFetchDotCount(0);

    const interval = setInterval(() => {
      setFetchDotCount((prev) => (prev + 1) % 4);
    }, 500);

    try {
      const { blob, filename } = await Fetch(url, (percent) => {
        setFetchProgress(percent);
      });

      downloadFile(blob, filename);

      clearInterval(interval);

      setFetchButtonText("Downloaded!");
      setFetchDotCount(0);
      setTimeout(() => setFetchButtonText("Download"), 2000);
    } catch (err) {
      clearInterval(interval);

      setFetchShowError(true);
      setFetchErrorText(err.message);

      setFetchButtonText("Download");
      setFetchDotCount(0);
    } finally {
      setFetchShowProgress(false);
    }
  };

  const axiosDownloadButton = async () => {
    const url = axiosLinkInputRef.current.value;

    if (!url) return;

    setAxiosShowError(false);
    setAxiosShowProgress(true);
    setAxiosProgress(0);

    setAxiosButtonText("Downloading");
    setAxiosDotCount(0);

    const interval = setInterval(() => {
      setAxiosDotCount((prev) => (prev + 1) % 4);
    }, 500);

    try {
      const { blob, filename } = await Axios(url, {}, (percent) => {
        setAxiosProgress(percent);
      });

      downloadFile(blob, filename);

      clearInterval(interval);

      setAxiosButtonText("Downloaded!");
      setAxiosDotCount(0);
      setTimeout(() => setAxiosButtonText("Download"), 2000);
    } catch (err) {
      clearInterval(interval);

      setAxiosShowError(true);
      setAxiosErrorText(err.message);

      setAxiosButtonText("Download");
      setAxiosDotCount(0);
    } finally {
      setAxiosShowProgress(false);
    }
  };

  const downloadFile = (blob, filename = "downloaded-file") => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-row mx-auto items-center justify-center mt-10">
      <div
        id="fetch"
        className="flex flex-col items-center justify-center ml-5"
      >
        <h1 className="mb-2">fetch</h1>
        <div className="bg-slate-300 h-[400px] w-[300px] rounded-[30px] flex flex-col items-center justify-center">
          <div
            id="link-input"
            className="flex flex-col justify-center items-center w-[80%] h-[70px] text-black"
          >
            <input
              ref={fetchLinkInputRef}
              value={fetchLink}
              onChange={(e) => {
                setFetchLink(e.target.value);
                setFetchShowError(false);
                setFetchProgress(0);
              }}
              className="bg-gray-200 rounded-[10px] p-3 focus:border-gray-400 hover:border-gray-400 transition-colors duration-200 border-[2px] border-solid border-gray-200 focus:ring-transparent focus:ring-0 focus:outline-none text-left"
              placeholder="Paste your file link"
            />
          </div>
          <div
            id="bar"
            className="w-[80%] h-[20px] flex flex-col justify-center items-center"
          >
            <div
              className={`w-[80%] bg-gray-100 h-[20px] rounded-full flex flex-col items-end transition-all duraiton-200 ${
                fetchShowProgress ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="bg-blue-400 h-[20px] rounded-full transition-all ease-in-out duration-500"
                style={{
                  width: `${Math.min(fetchProgress + 10, 100)}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          </div>
          <div
            id="button"
            className="w-[80%] h-[90px] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => fetchDownloadButton()}
              className="bg-blue-600 h-[70px] w-[200px] rounded-[15px] hover:bg-blue-800 transition-clicked duration-200 text-white active:bg-red-900 text-[20px] "
            >
              {".".repeat(fetchDotCount) + fetchButtonText}
            </button>
          </div>
          <div
            id="errorMessage"
            className="w-[80%] h-[20px] flex flex-col items-center justify-center text-red-600 p-4 "
          >
            <h2
              className={`transition-all duration-300 opacity-0 ${
                fetchShowError ? "opacity-100" : "opacity-0"
              }`}
            >
              {fetchErrorText}
            </h2>
          </div>
        </div>
      </div>
      <div id="axios" className="flex flex-col items-center justify-center">
        <h1 className="mb-2">axios</h1>
        <div className="bg-slate-300 h-[400px] w-[300px] rounded-[30px] flex flex-col items-center justify-center">
          <div
            id="link-input"
            className="flex flex-col justify-center items-center w-[80%] h-[70px] text-black"
          >
            <input
              ref={axiosLinkInputRef}
              value={axiosLink}
              onChange={(e) => {
                setAxiosLink(e.target.value);
                setAxiosShowError(false);
                setAxiosProgress(0);
              }}
              className="bg-gray-200 rounded-[10px] p-3 focus:border-gray-400 hover:border-gray-400 transition-colors duration-200 border-[2px] border-solid border-gray-200 focus:ring-transparent focus:ring-0 focus:outline-none text-left"
              placeholder="Paste your file link"
            />
          </div>
          <div
            id="bar"
            className="w-[80%] h-[20px] flex flex-col justify-center items-center"
          >
            <div
              className={`w-[80%] bg-gray-100 h-[20px] rounded-full flex flex-col items-end transition-all duraiton-200 ${
                axiosShowProgress ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="bg-blue-400 h-[20px] rounded-full transition-all ease-in-out duration-500"
                style={{
                  width: `${Math.min(axiosProgress + 10, 100)}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          </div>
          <div
            id="button"
            className="w-[80%] h-[90px] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => axiosDownloadButton()}
              className="bg-blue-600 h-[70px] w-[200px] rounded-[15px] hover:bg-blue-800 transition-clicked duration-200 text-white active:bg-red-900 text-[20px] "
            >
              {".".repeat(axiosDotCount) + axiosButtonText}
            </button>
          </div>
          <div
            id="errorMessage"
            className="w-[80%] h-[20px] flex flex-col items-center justify-center text-red-600 p-4 "
          >
            <h2
              className={`transition-all duration-300 opacity-0 ${
                axiosShowError ? "opacity-100" : "opacity-0"
              }`}
            >
              {axiosErrorText}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promis2;

/* the button and the error message should have different messages. */
