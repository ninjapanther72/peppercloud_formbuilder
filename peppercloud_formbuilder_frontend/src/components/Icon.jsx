import React from 'react';
import {checkNull} from "../utils/AppUtils";
import {THEME} from "../config/AppConfig";

//fa fa or bi bi icons
const Icon = React.memo(({
                             className = "",
                             icon = "",
                             size = "",
                             style = {},
                             color = "black",
                             highlightVariant = THEME,
                             tooltip,
                             onClick,
                         }) => {
    return (<>
            <span title={tooltip}>
                <i
                    className={`${icon} ${className} highlight-text-${checkNull(onClick) ? `${highlightVariant} cursor-pointer` : ''}`}
                    onClick={onClick}
                    style={{
                        fontSize: size,
                        color: color, ...style
                    }}
                />
            </span>
        </>
    )
});
export default Icon;
