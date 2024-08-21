import React, {useEffect} from 'react';
import {isBoolTrue} from "../utils/AppUtils";

const Flexbox = React.memo(({
                                className = "",
                                wrap = "nowrap",
                                wrapSm = "",
                                wrapMd = "",
                                direction = "",
                                directionMd = "",
                                directionSm = "",
                                shadowVariant = "none",
                                bg = "",
                                borderVariant = "none",
                                borderColor = "",
                                justifyAt = "",
                                justifyAtMd = "",
                                justifyAtSm = "",
                                alignAt = "",
                                alignAtMd = "",
                                alignAtSm = "",
                                overflow = "",
                                position = "",
                                gap = "",
                                scrollX = false,
                                scrollY = false,
                                scrollbar = true,
                                roundedVariant = 0,
                                hidden,
                                height,
                                disabled,
                                key,

                                children,
                                top,
                                right,
                                zIndex,
                                bottom,
                                left,

                                style = {},
                                ...rest
                            }) => {
    const TAG = "Flexbox";

    useEffect(() => {

    }, []);

    return (<>
            {!isBoolTrue(hidden) && <div
                className={`flexbox border-${borderVariant} bg-${bg} outline-none m-0x p-0 d-flex risen-${shadowVariant} 
                flex-${wrap} fd-${wrapSm}-sm fd-${wrapMd}-md
                fd-${direction} fd-${directionSm}-sm fd-${directionMd}-md 
                jc-${justifyAt} jc-${justifyAtSm}-sm jc-${justifyAtMd}-md
                al-${alignAt}  al-${alignAtSm}-sm al-${alignAtMd}-md
                position-${position}
                overflow-${overflow} 
                rounded-${roundedVariant}
                ${isBoolTrue(disabled) ? 'disable-item' : ''}
                ${isBoolTrue(scrollX) || isBoolTrue(scrollY) ? `scroller scroll-dark 
                ${isBoolTrue(scrollX) ? 'scroller-x-auto' : ''} ${isBoolTrue(scrollY) ? 'scroller-y-auto' : ''}${isBoolTrue(scrollbar) ? '' : 'no-bar'}` : ''}
                ${className}
                `}
                key={key}
                style={{
                    height: height,
                    backgroundColor: bg,
                    top: top,
                    bottom: bottom,
                    left: left,
                    right: right,
                    zIndex: zIndex,
                    borderColor: borderColor,
                    gap: gap,
                    ...style
                }}
                {...rest}>
                {children}
            </div>}
        </>
    )

    function fun() {

    }
})
export default Flexbox;
