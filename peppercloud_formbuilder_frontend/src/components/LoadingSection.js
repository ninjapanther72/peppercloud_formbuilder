import React from "react";
import { Label, LoadingCircle } from "./index";
import { getDefValueStr, isBoolTrue } from "../utils/AppUtils.js";

const LoadingSection = React.memo(
  ({
    imgClassName = "",
    labelClassName = "",
    imgWidth = "200px",
    imgHeight = "auto",
    heightClass = "100",
    image,
    color = "black",
    success,
    loading,
    show404Image = true,
    msg = "",
  }) => {
    const Image404 =
      "https://cdn.pixabay.com/photo/2016/10/25/23/54/not-found-1770320_1280.jpg";
    return (
      <>
        {(isBoolTrue(loading) || !isBoolTrue(success)) && (
          <div className="w-100 d-flex jc-center mt-3">
            <div>
              {isBoolTrue(show404Image) &&
                !isBoolTrue(loading) &&
                !isBoolTrue(success) && (
                  <div className="">
                    <img
                      className={`${imgClassName} rounded-4`}
                      src={getDefValueStr(image, Image404)}
                      width={imgWidth}
                      height={imgHeight}
                    />
                  </div>
                )}

              <div className={`d-flex jc-center al-center`}>
                {isBoolTrue(loading) && (
                  <LoadingCircle wrapperClassName={"m-1"} />
                )}

                {!isBoolTrue(loading) && (
                  <Label
                    className={`m-2 fs-normal ${
                      !isBoolTrue(success) ? "text-danger" : "text-dark"
                    } ${labelClassName}`}
                    widthClass={100}
                    color={color}
                    textAt={"center"}
                  >
                    {msg + ""}
                  </Label>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);
export default LoadingSection;
