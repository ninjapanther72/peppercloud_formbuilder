import React, {useEffect, useState} from 'react';
import {checkNullStr, isBoolTrue} from "../utils/AppUtils";
import {Label} from "./index";
import {THEME} from "../config/AppConfig";

/**Create a simple loader with single border*/
const LoadingCircle = React.memo(({
                                      wrapperClassName = "",
                                      widthClass = "100",
                                      className = "",
                                      labelClassName = "",
                                      sizeVariant = "",
                                      variant = THEME,
                                      size = "34px",
                                      borderWidth = "5px",
                                      labelFontSize = "13px",
                                      wrapperHeight = "100%",
                                      justifyAt = "center",
                                      alignAt = "center",
                                      label,
                                      center = true,
                                      showLabel = true,
                                      show = false,
                                      style = {},
                                      wrapperStyle = {},
                                      labelStyle = {},
                                  }) => {
    const TAG = "LoadingCircle";

    const [loaderSize, setLoaderSize] = useState(size);
    useEffect(() => {
        setLoaderSize(size);
    }, [size]);
    return (<>
            <div
                className={`p-0 m-1x d-flex 
                ${isBoolTrue(center) ? `w-${widthClass} jc-${justifyAt} al-${alignAt} transition` : ''} 
                ${wrapperClassName}`}
                style={{
                    height: wrapperHeight,
                    ...wrapperStyle
                }}
            >
                <div className={'m-0 p-0'} style={{height: wrapperHeight}}>
                    <div className={`simple-loader-wrapper p-1 m-0 ${className}`}
                         style={{height: wrapperHeight, ...style}}>
                        <div className={`simple-loader transition ${sizeVariant} ${variant} `}
                             style={{
                                 width: loaderSize,
                                 height: loaderSize,
                                 borderWidth: borderWidth,
                                 ...style
                             }}
                        />
                    </div>

                    {isBoolTrue(showLabel) && checkNullStr(label) && <div className={'m-0 p-0 mt-2x'}>
                        <Label className={`w-100 text-dark px-2 py-1 m-0 ${labelClassName}`} fontSize={labelFontSize} style={{...labelStyle}}>
                            {label}
                        </Label>
                    </div>}
                </div>
            </div>
        </>
    )
});
export default LoadingCircle;
