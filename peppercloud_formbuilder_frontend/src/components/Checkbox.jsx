import React from 'react';
import {binaryToBool, boolToBinary, checkNull, checkNullStr, isBoolTrue} from "../utils/AppUtils";
import {THEME} from "../config/AppConfig";

const Checkbox = React.memo(({
                                 className = "",
                                 wrapperClassName = "",
                                 labelClassName = "",
                                 id,
                                 key,
                                 tooltipText,
                                 endComponent,

                                 hidden = false,
                                 disabled = false,
                                 tooltip = true,
                                 scrolled = true,
                                 binary = false,
                                 precision = false,
                                 tooltipWordLimit = 30,
                                 fontSize = '',
                                 height,
                                 type = 'checkbox',
                                 alignAt = 'center',
                                 justifyAt = 'start',
                                 roundedVariant = '2',
                                 checkmarkMarginTop = '',
                                 labelColor,

                                 children,
                                 onChange,
                                 checked,
                                 defaultChecked,
                                 variant = THEME,
                                 highlightHoverVariant = 'dark',
                                 selectedHighlightVariant = '',
                                 highlightVariant = '',
                                 outlined = false,
                                 py = '1',
                                 px = '1',
                                 iMsg = '',
                                 iMsgIcon = "bi bi-info-circle-fill",

                                 style = {},
                                 wrapperStyle = {},
                                 labelStyle = {},
                                 ...rest
                             }) => {
    const TAG = "Checkbox";

    // useEffect(() => {
    // console.log(TAG, 'checked:', checked, 'defaultChecked:', defaultChecked);
    // }, [checked]);


    return (!isBoolTrue(hidden) && <>
        <label
            title={tooltip}
            key={key}
            className={`cb-label text-nowrap m-0 w-100 cursor-pointer rounded-${roundedVariant}   
                        ${isBoolTrue(scrolled) ? 'scroller scroller-x-auto no-bar' : ''} 
                        ${isBoolTrue(disabled) ? 'disable-item' : ''} 
                        ${checkNullStr(children) ? `px-${px} py-${py}` : 'p-0'} 
                         d-flex flex-nowrap jc-${justifyAt} al-${alignAt} bg-infox overflow-hidden ${wrapperClassName}
                          transition highlight-${highlightVariant} highlight-${highlightHoverVariant}-hover
                         ${isBoolTrue(defaultChecked) || isBoolTrue(checked) ? `highlight-${selectedHighlightVariant}` : ''}
                         ${isBoolTrue(outlined) ? `border-${selectedHighlightVariant}-dark border-${highlightHoverVariant}-hover` : ''}
                        `}
            style={{
                fontSize: fontSize,
                height: height,
                // border: isBoolTrue(outlined) ? `1.3px solid var(--${variant}Dark)` : 'none',
                borderWidth: isBoolTrue(outlined) ? `1.3px` : 'none',
                borderStyle: isBoolTrue(outlined) ? `solid` : 'none',
                ...wrapperStyle
            }}
        >
            <input className={`p-0 m-0x cursor-pointer ${className} ${variant}x ${isBoolTrue(disabled) ? 'disable-item' : ''}`}
                   style={{margin: `${checkmarkMarginTop} 0 0 0`, ...style}}
                   type={type}
                   disabled={disabled}
                   checked={isBoolTrue(binary) ? binaryToBool(checked) : checked}
                   defaultChecked={isBoolTrue(binary) ? binaryToBool(defaultChecked) : defaultChecked}
                   onChange={(e) => {
                       const value = e.target.checked;
                       // printLog(children + ".value:", value);
                       if (checkNull(onChange)) onChange(e, isBoolTrue(binary) ? boolToBinary(value) : value, children);
                   }}
                   {...rest}
            />
            {(checkNull(children) || checkNullStr(iMsg) || checkNull(endComponent)) &&
                <span
                    className={`d-flex w-100 px-1 cb-text jc-start al-center text-nowrap flex-nowrap fd-row position-relative ${labelClassName} ${isBoolTrue(disabled) ? 'disable-item' : ''} `}
                    style={{
                        color: labelColor,
                        ...labelStyle
                    }}>
                    <span className={`w-auto ${isBoolTrue(disabled) ? 'disable-item-lg' : ''} `}>
                        <span>{children}</span>
                    </span>
                </span>}
        </label>
    </>)

});

export default Checkbox;
