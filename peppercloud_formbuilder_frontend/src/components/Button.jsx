import React, {forwardRef, useEffect, useState} from 'react';
import {checkNull, checkNullStr, getDefValueStr, isBoolTrue} from "../utils/AppUtils";
import Image from "./Image";
import {CssVariant, THEME} from "../config/AppConfig";
import {Link} from "react-router-dom";

/**
 * Creates a button widget to show text/icon or both.
 *
 */
const Button = forwardRef(({
                               className = `bg-${THEME}`,
                               wrapperClassName = '',
                               iconClass = "",
                               loadingClassName = "",
                               disabledClassName = "",
                               icon,
                               id = "",
                               as,
                               key,
                               border = "none",
                               padding = "",
                               text,
                               circular = false,
                               elastic = false,
                               sleek = false,
                               highlightOnHover = false,
                               highlightVariant = '',
                               highlightTextOnHover = false,
                               hidden = false,
                               disableIconDrag = true,
                               disabled = false,
                               rounded = true,
                               disableRipple = false,
                               rippleColor = "var(--ripple-color)",
                               autoDisableContextMenu = true,
                               enableFocusStyling = true,
                               tabIndex,
                               fontSize,
                               onClick,
                               onLinkClick,
                               onMouseEnter,
                               onMouseLeave,
                               onMouseDown,
                               onFocus,
                               onMouseUp,
                               onMouseOver,
                               onMouseOut,
                               onContextMenu,
                               width = "auto",
                               height = "auto",
                               iconGap = ".5em",
                               href,
                               target,
                               type,
                               name,
                               value,
                               vertical,
                               title,
                               checked,

                               mx,
                               ml,
                               mr,
                               my,
                               mt,
                               mb,
                               m,

                               onInputChange,
                               appendRandomId = false,
                               appendRandomClass = false,
                               outlined = false,
                               active = false,
                               asLoading = false,
                               asLink = true,
                               customSpinner,
                               endComponent,
                               customSpinnerAtEnd = false,
                               iconAtEnd = false,
                               textOnLoading = true,
                               noCursorOnLoading = true,
                               loadingColorVariant = CssVariant.light,
                               loadingSizeVariant = 'sm',
                               loadingWidth = "auto",
                               variant = "",
                               textClassName = "",
                               transitionVariant = "sm",
                               disableVariant = "disable-item-xs",
                               color = 'white',
                               fontWeight = "normal",
                               fontFamily = "inherit",
                               spinnerStyle = {},
                               style = {},
                               hoverStyle = {},
                               pressStyle = {},
                               rippleStyle = {},
                               internalStyle = {},
                               iconStyle = {},
                               iconSize,
                               borderRadius,
                               backgroundColor,

                               ...rest
                           }, ref = null) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        try {
            if (checkNull(ref)) {
                const button = ref.current;
                if (checkNull(button) && checkNull(icon)) {
                    const children = button.children;
                    for (let child of children) {
                        if (child !== null && child !== undefined) {
                            // child.style.fontSize = fontSize;
                            // child.style.color = color;
                            // child.classList.add(iconClass);
                            if (checkNull(iconStyle, {})) {
                                // child.style = iconStyle;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
    }, [])

    // return (!hidden && createButton())
    return (!hidden && ((isBoolTrue(asLink) && checkNullStr(href)) ? createLinkButton() : createButton()));

    // return (createButton())

    function createLinkButton() {
        return <Link to={href}
                     className={`m-0 p-0 mx-${mx} ms-${ml} me-${mr} my-${my} mt-${mt} mb-${mb} m-${m} ${isBoolTrue(disabled) ? `disable-item-${disableVariant}` : 'cursor-pointer'} ${wrapperClassName}`}
                     target={target}
                     referrerPolicy={'no-referrer'}
                     onClick={onLinkClick}
            // onClick={onClick}
        >
            {createButton()}
        </Link>
    }

    function createButton() {
        return <button
            // itemRef={ref}
            // ref={ref}
            role={as}
            key={key}
            // href={href}
            // target={target}
            type={type}
            name={name}
            value={value}
            onChange={onInputChange}
            // disabled={disabled}
            className={`button pc-button text-center text-center-force text-capitalize select-none 
                ${(isBoolTrue(highlightOnHover) || checkNullStr(highlightVariant)) ? `highlight-${highlightVariant}-hover` : ""}
                 ${isBoolTrue(highlightTextOnHover) ? `text-${THEME}-hover` : ""} 
                 ${isBoolTrue(isBoolTrue(noCursorOnLoading) && isBoolTrue(asLoading)) ? "cursor-ban" : ""} 
                 transition-${transitionVariant}
                 bg-${variant} 
                 btn-${variant} 
                 ${isBoolTrue(outlined) ? `border-solid border-1-5 border-${variant} bg-t blur-5` : ""}
                 ${isBoolTrue(disabled) ? disableVariant : ""}
                 ${isBoolTrue(disabled) ? disabledClassName : ""}
                 ${isBoolTrue(rounded) ? "rounded-2" : "rounded-0"}
                 ${isBoolTrue(sleek) ? "m-1x text-lightx rounded-10 px-3 py-1 w-auto shadow-none" : ""}
                 ${isBoolTrue(circular) ? "circular" : ""}
                 ${isBoolTrue(elastic) ? "elastic" : ""}
                 ${isBoolTrue(asLoading) ? "w-auto" : ""}
                 ${!(isBoolTrue(asLink) && checkNullStr(href)) ? `m-0 p-0 mx-${mx} ms-${ml} me-${mr} my-${my} mt-${mt} mb-${mb} m-${m}` : ''}
                 bg-${variant} btn-${variant}
                 ${className}
                 `}
            style={{...getStyles()}}
            onClick={(e) => {
                if (onClick && !isBoolTrue(disabled) && !isBoolTrue(asLoading)) onClick(e);
            }}
            // onMouseEnter={onMouseEnter}
            // onMouseLeave={onMouseLeave}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onMouseEnter={() => {
                setIsHovered(true);
                if (onMouseEnter) onMouseEnter();
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                if (onMouseLeave) onMouseLeave();
            }}
            onFocus={() => {
                if (isBoolTrue(enableFocusStyling)) setIsHovered(true);
                if (onFocus) onFocus();
            }}
            onMouseDown={() => {
                setIsPressed(true);
                if (onMouseDown) onMouseDown();
            }}
            onMouseUp={() => {
                setIsPressed(false);
                if (onMouseUp) onMouseUp();
            }}
            onContextMenu={(e) => {
                if (!checkNullStr(href) && isBoolTrue(autoDisableContextMenu)) e.preventDefault();
                if (onContextMenu) onContextMenu(e);
            }}
            disableRipple={disableRipple}
            tabIndex={tabIndex}
            title={title}
            TouchRippleProps={{
                sx: {
                    // color: rippleColor,
                    color: (isBoolTrue(asLoading) || isBoolTrue(disabled)) ? 'transparent' : (canSetLightRipple() ? 'var(--ripple-color-light)' : rippleColor), ...rippleStyle
                }
            }}
            {...rest}
        >
            <span
                className={`m-0 p-0 w-100 h-100 d-flex position-relative ${transitionVariant} ${textClassName} justify-content-center align-items-center text-center`}
                ref={ref}
                // style={{color: color}}
                id={id}>
                {(customSpinner && !isBoolTrue(customSpinnerAtEnd)) && customSpinner}
                {isBoolTrue(asLoading) && getSpinner()}
                {(!isBoolTrue(iconAtEnd)) && getIcon()}
                {checkNull(getText(), "") && getText()}
                {(isBoolTrue(iconAtEnd)) && getIcon()}
                {(customSpinner && isBoolTrue(customSpinnerAtEnd)) && customSpinner}
                {endComponent && endComponent}
            </span>
        </button>
    }

    function getStyles() {
        return {
            fontFamily: fontFamily,
            border: border,
            color: color,
            width: asLoading ? loadingWidth : width,
            height: height,
            minWidth: asLoading ? loadingWidth : width,
            minHeight: height,
            maxWidth: asLoading ? loadingWidth : width,
            maxHeight: height,
            padding: padding,
            fontWeight: fontWeight,
            borderRadius: borderRadius,
            backgroundColor: backgroundColor,
            cursor: 'pointer',
            fontSize: fontSize, ...style, ...(isBoolTrue(asLoading) || isBoolTrue(disabled)) ? {} : {
                ...isHovered ? hoverStyle : {},
                ...isPressed ? pressStyle : {},
            }
        }
    }

    function getIcon() {
        const outIcon = (!checkNullStr(icon)) ? <i className={`${iconClass} bt-icon`}
                                                   style={{
                                                       fontSize: checkNull(iconClass, "") ? iconSize : "0",
                                                       marginRight: isTextNull() ? "0" : iconGap, ...iconStyle,
                                                       color: color, // filter: `brightness(25%) saturation(20%)`,
                                                       opacity: isBoolTrue(disabled) ? .8 : 1,
                                                   }}/>
            // : icon;
            : <Image className={`bt-icon ${iconClass}`}
                     disableDrag={disableIconDrag}
                     wrapperClassName={''}
                     src={icon}
                     width={getDefValueStr(iconSize, fontSize)} height={getDefValueStr(iconSize, fontSize)}
                     style={{
                         marginRight: isTextNull() ? "0" : iconGap, ...iconStyle, color: color
                     }}
            />;
        if (isBoolTrue(asLoading)) {
            if (isBoolTrue(textOnLoading)) {
                return outIcon
            } else {
                return null;
            }
        } else {
            return outIcon
        }
    }

    function getText() {
        return asLoading ? (textOnLoading ? text : "") : text
    }

    function isTextNull() {
        return text == null || text === "" || text + "".length === 0
    }

    function getSpinner() {
        return <span className={`p-0 m-0x px-2x pt-1x position-absolutex ${loadingClassName} ${(isBoolTrue(textOnLoading) && checkNullStr(text)) ? 'pr-2' : 'pr-0'}`}
                     style={{margin: `0 0 ${isBoolTrue(circular) ? '0' : '-.25rem'} 0`, top: 'calc(.15rem+25%)', left: '-1%'}}>
            <span className={`spinner spinner-border spinner-border-${loadingSizeVariant} text-${loadingColorVariant}`}
                  role="status" style={{width: fontSize, height: fontSize, ...spinnerStyle}}>
            </span>
        </span>
    }

    function canSetLightRipple() {
        const v = (variant + '').toLowerCase();
        return (v.includes('primary') || v.includes('info') || v.includes('danger') || v.includes('success') || v.includes('warning')) && (!v.includes('light'));
    }
});


export default Button;
