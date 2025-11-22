import { useState, useRef } from "react";

const Promis = () => {
  /* the image will be empty until it gets fully downloaded and then will fade in like it just shows right after being downloaded. the progress bar should show the process of download and the text in the button should change from download to downloading with three dots going from one dot to three dots. after that it shuold show "downloaded!" when it is done. it should have a link input in top of the progress bar to receive the link and after that the progress bar shuold fade in as well to show the whole process.*/

  const [buttonText, setButtonText] = useState("Download");

  const [imageSrc, setImageSrc] = useState(null);

  const [link, setLink] = useState("");

  const linkInputRef = useRef(null);

  const errorMessage = "Invalid link";

  const DownloadButton = () => {
    const url = linkInputRef.current.value;
    if (!url) return;

    try {
      new URL(url);
    } catch {
      setShowError(true);
      setButtonText("Download");
      return;
    }

    setProgress(0);
    setShowProgress(true);
    setShowError(false);
    setButtonText("Downloading");

    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setButtonText(".".repeat(dotCount) + "Downloading");
    }, 500);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      clearInterval(interval);
      if (xhr.status === 200) {
        const blob = xhr.response;
        const imgURL = URL.createObjectURL(blob);
        setImageSrc(imgURL);
        setButtonText("!Donwloaded");
        setTimeout(() => {
          setButtonText("Download");
        }, 2000);
      } else {
        setShowError(true);
        setButtonText("Download");
      }
    };

    xhr.onerror = () => {
      clearInterval(interval);
      setShowError(true);
      setButtonText("Download");
    };

    xhr.send();
  };

  const [progress, setProgress] = useState(0);

  const [showProgress, setShowProgress] = useState(false);

  const [showError, setShowError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-5">image downloader</h1>
      <div className="bg-slate-300 h-[500px] w-[400px] rounded-[30px] flex flex-col items-center justify-center">
        <div
          id="image"
          className="w-[80%] h-[200px] rounded-[15px] flex flex-col items-center justify-center overflow-hidden p-5"
        >
          {imageSrc && (
            <img
              alt="Downloaded"
              src={imageSrc}
              className="max-w-full max-h-full w-auto h-auto opacity-0 animate-fadeIn"
            />
          )}
        </div>
        <div
          id="link-input"
          className="flex flex-col justify-center items-center w-[80%] h-[70px] text-black"
        >
          <input
            ref={linkInputRef}
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setImageSrc(null);
              setShowError(false);
              setProgress(0);
            }}
            className="bg-gray-200 rounded-[10px] p-3 focus:border-gray-400 hover:border-gray-400 transition-colors duration-200 border-[2px] border-solid border-gray-200 focus:ring-transparent focus:ring-0 focus:outline-none text-left"
            placeholder="Paste your image link"
          />
        </div>
        <div
          id="bar"
          className="w-[80%] h-[20px] flex flex-col justify-center items-center"
        >
          <div
            className={`w-[80%] bg-gray-100 h-[20px] rounded-full flex flex-col items-end transition-all duraiton-200 ${
              showProgress ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="bg-blue-400 h-[20px] rounded-full transition-all ease-in-out duration-500"
              style={{
                width: `${progress}%`,
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
            onClick={() => DownloadButton()}
            className="bg-blue-600 h-[70px] w-[200px] rounded-[15px] hover:bg-blue-800 transition-clicked duration-200 text-white active:bg-red-900 text-[20px]"
          >
            {buttonText}
          </button>
        </div>
        <div
          id="errorMessage"
          className="w-[80%] h-[20px] flex flex-col items-center justify-center text-red-600 p-4 "
        >
          <h2
            className={`transition-all duration-300 opacity-0 ${
              showError ? "opacity-100" : "opacity-0"
            }`}
          >
            {errorMessage}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Promis;
