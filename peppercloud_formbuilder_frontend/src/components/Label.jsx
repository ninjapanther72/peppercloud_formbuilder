import React from 'react';
import {checkNullStr, isBoolTrue, subtractSize} from "../utils/AppUtils";

/**
 * A fully customizable label component.
 *
 * @example
 * <Label
 *      className={'fs-md m-0 p-0 px-1 text-nowrap'}
 *      textAt={'start'}
 *      variant={'primary'}
 *      color={'black'}
 *      asTag={false}
 *      bordered={false}
 *      iconClass={'fa fa-heart'}
 *      icon={'icon.png'}
 *      bgColor={'transparent'}
 *      style={{}}
 *      onClick={handleLabelClick}>
 *      You text
 * </Label>
 */
const Label = React.memo(({
                              className = "",
                              variant = "",
                              widthClass = "",

                              bgColor = "",
                              color = "black",
                              overflow = "",
                              fontSize = "",
                              bordered = false,
                              textAt = "start",
                              alightAt,
                              width,
                              height,
                              iconStyle = {},

                              id,
                              key,
                              asTag = false,

                              children,
                              iconClass = "",
                              icon,

                              style = {},
                              onClick,
                              ...rest
                          }) => {
    const TAG = "Label";

    return (<>
        <label
            className={`w-${widthClass} text-${textAt} rounded-2 ${className} `}
            id={id}
            key={key}
            style={{
                width: width,
                height: height,
                fontSize: fontSize,
                color: color,
                backgroundColor: bgColor,
                padding: isBoolTrue(asTag) ? '.1rem .8rem' : '',
                ...style,
            }}
            onClick={onClick}
            {...rest}
        >
            {(checkNullStr(icon) || checkNullStr(iconClass)) &&
                <span>
                       {checkNullStr(iconClass) ? <i className={`${iconClass}`}
                                                     style={{
                                                         color: color,
                                                         fontSize: checkNullStr(fontSize) ? subtractSize(fontSize, 2) : '',
                                                         ...iconStyle
                                                     }}/>
                           : <img src={icon}
                                  className={`object-fit-cover p-0 m-0`}
                                  style={{
                                      width: checkNullStr(fontSize) ? subtractSize(fontSize, 2) : '',
                                      height: checkNullStr(fontSize) ? subtractSize(fontSize, 2) : '',
                                      ...iconStyle
                                  }}
                           />
                       }
                    </span>
            }
            <span>{children}</span>
        </label>
    </>)

    function fun() {

    }
});
export default Label;
