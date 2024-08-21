import React, {useEffect, useRef} from 'react';
import {isBoolTrue, printError} from "../utils/AppUtils";
import useScreenSize from "../hooks/useScreenSize";


const IMsgButton = ({
                        className = '',
                        tooltip,
                        children,
                        hideOnMouseAway = false,
                        show = false,
                        variant = 'gray',
                        hoverVariant = 'dark',
                        ...props
                    }) => {

    const TAG = 'IMsgButton.jsx';

    const [open, setOpen] = React.useState(isBoolTrue(show));
    const ref = useRef();
    const {isScreenUpSm} = useScreenSize();

    useEffect(() => {
        setOpen(isBoolTrue(show));
    }, [show]);
    useEffect(() => {
        function actionsOnOutsideClick(ref) {
            function handleClickOutside(event) {
                try {
                    if (ref.current && !ref.current.contains(event.target)) {
                        setOpen(false);
                        // window.alert("You clicked outside of me!");
                        // printLog(TAG, "You clicked outside of me!");
                    }
                } catch (error) {
                    printError(TAG, error);
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }

        // if (isBoolTrue(open))
        actionsOnOutsideClick(ref);
    }, []);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(!open);
    };


    return (
        <span
            ref={ref}
            onClose={handleTooltipClose}
            title={<span className={`text-wrap text-break word-wrap`}>{tooltip}</span>}
            {...!isScreenUpSm ? {
                disableHoverListener: !isBoolTrue(hideOnMouseAway),
            } : {}}
            {...props}
        >
            {children ?
                <span className={` ${className} `}
                    // ref={ref}
                      onClick={handleTooltipOpen}>
                    {children}
                </span>
                :
                <i className={`text-${variant} highlight-text-${hoverVariant}-hover highlight-text-${hoverVariant}-focus fs-normal transition cursor-pointer bi bi-info-circle-fill ${className}`}
                   onContextMenu={(e) => e.preventDefault()}
                    // ref={ref}
                   onClick={handleTooltipOpen}/>}
        </span>
    );
};

export default IMsgButton;
