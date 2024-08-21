import React from 'react';
import {Image, Label, LoadingCircle, Section} from "./index";
import {getDefValueStr, isBoolTrue} from "../utils/AppUtils.js";

const Image404 = 'https://cdn.pixabay.com/photo/2016/10/25/23/54/not-found-1770320_1280.jpg';
const LoadingPanel = React.memo(({
                                     wrapperClassName = "",
                                     imgClassName = "",
                                     labelClassName = "",
                                     imgWidth = '200px',
                                     imgHeight = 'auto',
                                     heightClass = "100",
                                     image,
                                     color = 'black',
                                     success,
                                     loading,
                                     show404Image = true,
                                     msg = '',
                                 }) => {
    return (<>
            {/*<div>*/}
            {/*    <div>loading: {loading + ''}</div>*/}
            {/*    <div>success: {success + ''}</div>*/}
            {/*    <div>msg: {msg + ''}</div>*/}
            {/*</div>*/}
            {(isBoolTrue(loading) || !isBoolTrue(success)) &&
                <div>
                    {(isBoolTrue(show404Image) && !isBoolTrue(loading) && !isBoolTrue(success)) &&
                        <img
                            className={`${imgClassName}`}
                            src={getDefValueStr(image, Image404)}
                            width={imgWidth}
                            height={imgHeight}
                        />}

                    <div className={`section h-${heightClass} borderless p-0 m-0 mt-2 d-flex jc-center al-center`}
                         style={{width: '100%'}}>
                        {(isBoolTrue(loading)) && <LoadingCircle wrapperClassName={'m-1'}/>}

                        {!isBoolTrue(loading) && <Label className={`m-2 w-100 fs-normal ${labelClassName}`} color={color}>{msg + ''}</Label>}
                    </div>
                </div>}
        </>
    )
});
export default LoadingPanel;
