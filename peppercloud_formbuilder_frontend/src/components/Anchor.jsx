import React, {useState} from 'react';
import {checkNullStr, getDefValueStr, isBoolTrue} from "../utils/AppUtils";
import {Link} from "react-router-dom";

const Anchor = React.memo(({
                               wrapperClassName = "",
                               className = "",
                               variant = "",

                               bgColor = "",
                               color = "black",
                               overflow = "",
                               fontSize = "",
                               hoverColor = 'var(--primary)',
                               href,
                               to,
                               rel,
                               onLinkClick,
                               onClick,
                               target = "",
                               bordered = false,
                               asLink = true,
                               disabled = false,
                               simple = false,
                               textAt = "start",
                               width,
                               height,
                               iconStyle = {},

                               id,
                               key,

                               children,
                               iconClass = "",
                               icon,
                               startControls,
                               endControls,

                               onMouseEnter,
                               onMouseLeave,
                               onMouseDown,
                               onMouseUp,

                               style = {},
                               hoverStyle = {},
                               pressStyle = {},
                               ...rest
                           }) => {
    const TAG = "Anchor";

    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    return (<>
        {(!isBoolTrue(simple) && checkNullStr(getDefValueStr(href, to))) ? createLinkAnchor() : createSimpleAnchor()}
    </>)

    function createSimpleAnchor() {
        return <a
            className={`cursor-pointer p-0 m-0 ${(isBoolTrue(asLink)) ? 'footer-link' : ''} jc-${textAt} text-${textAt} ${className} ${isBoolTrue(disabled) ? `disable-item` : ''}`}
            href={getDefValueStr(href, to)}
            target={target}
            rel={(target + "").includes('_blank') ? 'noopener noreferrer ' + rel : rel}
            {...getBasicProps()}
        >
            {children}
        </a>
    }

    function createLinkAnchor() {
        return <Link
            className={`w-100x m-0 p-0 d-flex ${wrapperClassName}`}
            to={getDefValueStr(href, to)}
            target={target}
            rel={(target + "").includes('_blank') ? 'noopener noreferrer ' + rel : rel}
            onClick={(e) => {
                if (e.ctrlKey && checkNullStr(href)) {
                    window.open(href, '_blank');
                } else {
                    if (onLinkClick) onLinkClick(e);
                }
                // if (onLinkClick) onLinkClick(e);
            }}
        >
            <label
                className={`cursor-pointer p-0 m-0 ${(isBoolTrue(asLink)) ? 'footer-link' : ''} jc-${textAt} text-${textAt} ${className} ${isBoolTrue(disabled) ? `disable-item` : ''}`}
                {...getBasicProps()}>
                {children}
            </label>
        </Link>
    }

    function getBasicProps() {
        return {
            id: id,
            key: key,
            style: {
                width: width,
                height: height,
                fontSize: fontSize,
                color: color,
                backgroundColor: bgColor,
                ...style,
                ...(isBoolTrue(disabled)) ? {} : {
                    ...isHovered ? {
                        color: hoverColor,
                        ...hoverStyle,
                    } : {},
                    ...isPressed ? {
                        color: hoverColor,
                        ...pressStyle,
                    } : {},
                }
            },
            onClick: ((e) => {
                if (e.ctrlKey && checkNullStr(href)) {
                    window.open(href, '_blank');
                } else {
                    if (onClick) onClick(e);
                }
                // if (onClick) onClick(e);
            }),
            onMouseEnter: (() => {
                setIsHovered(true);
                if (onMouseEnter) onMouseEnter();
            }),
            onMouseLeave: (() => {
                setIsHovered(false);
                if (onMouseLeave) onMouseLeave();
            }),
            onMouseDown: (() => {
                setIsPressed(true);
                if (onMouseDown) onMouseDown();
            }),
            onMouseUp: (() => {
                setIsPressed(false);
                if (onMouseUp) onMouseUp();
            }),
            ...rest
        }
    }
});
export default Anchor;


