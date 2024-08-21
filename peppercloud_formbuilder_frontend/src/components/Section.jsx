import React from 'react';
import {checkNull, checkNullStr, getDefValueStr, isBoolTrue} from "../utils/AppUtils.js";
import {Button, Image} from "./index";

/**
 * @example
 *  <Section
 *                     className={`${GL_PANEL_SECTION_BORDERLESS_CLS} p-0 px-3`}
 *                     title={parentModuleName}
 *                     titleClassName={''}
 *                     titleAt={'center'}
 *                     overflow={'hidden'}
 *                     contentClassName={''}
 *                     shadowVariant={'sm'}//md, lg, xl, xs
 *                     borderless={true}>
 *                     //children go here
 *                 </Section>
 */
const Section = React.memo(({
                                className = '',
                                style = {},
                                id = '',
                                key = 'section',
                                forwardRef,

                                titleIcon,
                                titleIconWrapperClass,
                                titleIconClass,
                                titleIconSize,
                                headerClassName = '',
                                titleWrapperClassName = '',
                                headerStyle = {},

                                title,
                                titleSize,
                                titleColor,
                                titleClassName = '',
                                titleStyle = {},
                                titleAt = 'center',

                                subtitle,
                                subtitleStyle = {},
                                subtitleClassName = '',
                                subtitleAt = 'center',

                                bgImage,
                                bgBrightness = "0",
                                bgFit = 'cover',
                                borderColor = 'gray',
                                backgroundColor = '',
                                bg = 'transparent',
                                // bg = 'var(--bodyColor)',

                                headerControlIcon = '',
                                onHeaderButtonClick,
                                headerControlText,
                                headerControlColor = '',
                                headerControlClassName = '',
                                headerControlStyle = {},
                                showHeaderControl = false,
                                headerControlAtEnd = true,
                                borderless = false,
                                titleIconAsImage = false,

                                titleContent,

                                headerControlHref,
                                headerControlW,
                                headerControlH = '22px',
                                headerControls,

                                overflow = "hidden",
                                position = "",

                                roundedVariant = 4,
                                shadowVariant = 'none',
                                scrollVariant = 'dark',
                                scrolled = false,
                                hoverShadow = '',
                                scrollX = false,
                                scrollY = false,
                                height = "",
                                asContainer = false,
                                asContainerFluid = false,

                                contentClassName,
                                contentStyle = {},

                                footer,
                                children,
                                ...rest
                            }) => {
    return (<div
        ref={forwardRef}
        itemRef={forwardRef}
        className={`section transition-sm rounded-${roundedVariant} bg-${getDefValueStr(bg, backgroundColor)}  
            ${isBoolTrue(borderless) ? 'borderless risen-xsx shadow-nonex' : 'shadow-nonex border-1'}
            risen-${shadowVariant} 
            ${(isBoolTrue(scrolled) || isBoolTrue(scrollX) || isBoolTrue(scrollY)) ? `scroller scroll-${scrollVariant} 
            ${isBoolTrue(scrollX) ? 'scroller-x-auto' : ''} ${isBoolTrue(scrollY) ? 'scroller-y-auto' : ''}` : ''} 
            position-${position}
            overflow-${overflow}
            ${isBoolTrue(asContainerFluid) ? 'container-fluid' : ''}
             ${className}
            `}
        key={key}
        id={id}
        onMouseEnter={(e) => {
            try {
                // e.target.style.boxShadow = hoverShadow;
                // e.target.style.borderColor = isBoolTrue(borderless) ? 'transparent' : borderColor;
            } catch (error) {
            }
        }}
        onMouseLeave={(e) => {
            try {
                // e.target.style.boxShadow = shadowVariant;
            } catch (error) {
            }
        }}
        style={{
            background: (checkNull(bgImage)) ? `linear-gradient(rgba(0, 0, 0, ${bgBrightness}), rgba(0, 0, 0, ${bgBrightness})), url(${bgImage}) no-repeat center center` : "",
            backgroundSize: bgFit,
            border: isBoolTrue(borderless) ? 'none' : `1px solid ${borderColor}`,
            backgroundColor: getDefValueStr(bg, backgroundColor),
            height: height,
            boxShadow: shadowVariant,
            ...style
        }}
        {...rest}
    >
        {/*header*/}
        {(checkNullStr(title) || checkNullStr(subtitle) || checkNullStr(titleIcon) || checkNull(titleContent) || checkNull(headerControls) || checkNull(showHeaderControl)) &&
            <div className={`header p-0 d-flex position-relative ${headerClassName}`} style={{...headerStyle}}>
                <div className={`title-wrapper d-flex jc-${titleAt} bg-infox al-center flex-nowrap fd-row w-100 m-0 p-0 position-relative ${titleWrapperClassName}`}>
                    {checkNullStr(titleIcon) &&
                        <span className={`px-1 pr-2 ${isBoolTrue(titleIconAsImage) ? '' : titleIconWrapperClass}`}>{isBoolTrue(titleIconAsImage) ? <Image
                            wrapperClassName={titleIconWrapperClass}
                            className={titleIconClass}
                            width={titleIconSize}
                            height={titleIconSize}
                            src={titleIcon}
                        /> : <i className={`${titleIcon} ${titleIconClass}`} style={{fontSize: titleIconSize}}/>}</span>}

                    {/*title*/}
                    {checkNullStr(title) &&  <h5 className={`title m-0 py-1 pb-2x pb-1 p-0 jc-${titleAt}x ${titleClassName} d-flex w-auto`}
                            style={{fontSize: titleSize, color: titleColor, ...titleStyle}}>{title}</h5>}

                    {titleContent && titleContent}

                    {/*subtitle*/}
                    {checkNullStr(subtitle) && <p className={`subtitle justify-content-${subtitleAt} ${subtitleClassName}`} style={{...subtitleStyle}}>
                        {subtitle}
                    </p>}
                </div>

                {/*Header control*/}
                {(isBoolTrue(showHeaderControl) || checkNull(headerControls)) &&
                    <div className={`headerControl-wrapper position-relative justify-content-end w-auto d-flex p-0 m-0`}>
                        {headerControls && headerControls}
                        {/*{checkNull(headerControl)}*/}
                        {(checkNullStr(headerControlText) || checkNullStr(headerControlIcon)) && <Button
                            className={`shadow-none ${isBoolTrue(headerControlAtEnd) ? 'position-absolute' : ''} ${headerControlClassName} text-${headerControlColor}`}
                            iconClass={`${headerControlIcon}`}
                            text={headerControlText}
                            href={headerControlHref}
                            width={headerControlW}
                            height={headerControlH}
                            style={{top: "0rem", right: "0rem", ...headerControlStyle}}
                            onClick={onHeaderButtonClick}/>}
                    </div>}
            </div>}

        {/*content*/}
        <div className={`content 
            ${contentClassName} 
            ${isBoolTrue(asContainer) ? 'container' : ''}
            `}
             style={{...contentStyle}}>
            {children}
        </div>

        {/*footer*/}
    </div>);
});
export default Section;
