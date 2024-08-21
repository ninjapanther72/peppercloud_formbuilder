import React, {useEffect} from 'react';
import {checkNull, getArrIndexValue, isBoolTrue, isNumOdd, isValueBool} from "../utils/AppUtils";

const GridBox = React.memo(({
                                className = "",
                                wrap = "wrap",
                                direction = "row",
                                justifyAt = "",
                                alignAt = "",
                                overflow = "",
                                itemWrapperClassName = "",
                                children,
                                height,
                                minHeight,
                                gap = 1,
                                gapX,
                                gapY,
                                sm = 12,//[12,12]
                                md = 12,//[12,12]
                                lg,//[]
                                columnCount = -1,
                                vertical = false, // verticalItemCount = [] | 0,//[2, 2] or 2
                                verticalItemCount = 3,//[2, 2] or 2
                                adaptive = false,
                                style = {},
                                itemWrapperStyle = {},
                            }) => {
    const TAG = "GridBox";
    useEffect(() => {
        // printLog(TAG,'useEffect.children.len:', getArrLen(React.Children.toArray(children)));
        // printLog(TAG,'useEffect.children.count:', React.Children.count(children));
    }, [children]);

    // const filteredChildren = React.Children.toArray(children).filter(child => checkNull(child) && !isValueBool(child));

    return (<>
        <div
            className={`row 
                flex-${isBoolTrue(vertical) ? 'wrap' : wrap} 
                fd-${isBoolTrue(vertical) ? 'column' : direction} 
                justify-content-${justifyAt} 
                align-items-${alignAt} 
                overflow-${overflow} 
                ${className}
                `}
            style={{
                height: height,
                minHeight: minHeight,
                ...style
            }}>
            {getRenderList().map((child, index) => {
                return (checkNull(child) && !isValueBool(child)) &&
                    <div key={index + 'xx'}
                         className={`col-sm-${getArrIndexValue(sm, index, sm)} 
                            col-md-${(isBoolTrue(adaptive) && (index + 1) === React.Children.count(getRenderList()) && isNumOdd((index + 1))) ? 12 : getArrIndexValue(md, index, md)}
                            col-lg-${getArrIndexValue(lg, index, lg)} 
                            p-${gap} px-${gapX} py-${gapY} h-auto
                            ${itemWrapperClassName}`}
                         style={itemWrapperStyle}>
                        <div className={`w-100 h-100 m-0 p-${gap}`}>
                            {child}
                        </div>
                    </div>
            })}
        </div>
    </>)

    function getRenderList() {
        return React.Children.toArray(children).filter(child => checkNull(child) && !isValueBool(child));
    }
});
export default GridBox;
