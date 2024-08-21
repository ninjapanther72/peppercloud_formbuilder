import {useEffect, useState} from 'react';
import {parseInteger} from "../utils/AppUtils";

const useScreenSize = () => {
    const W_SM = 576;
    // const W_MD = 778;
    const W_MD = 768;
    const W_NORMAL = 992;
    const W_LG = 1200;

    const [isScreenXs, setIsScreenXs] = useState(window.innerWidth < W_SM);
    const [isScreenSm, setIsScreenSm] = useState(window.innerWidth >= W_SM && window.innerWidth < W_MD);
    const [isScreenMd, setIsScreenMd] = useState(window.innerWidth >= W_MD && window.innerWidth < W_NORMAL);
    const [isScreenLg, setIsScreenLg] = useState(window.innerWidth >= W_NORMAL && window.innerWidth < W_LG);
    const [isScreenXl, setIsScreenXl] = useState(window.innerWidth >= W_LG);
    const [isScreenResizing, setIsScreenResizing] = useState(false);
    const [currScreenWidth, setCurrScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            setCurrScreenWidth(screenWidth);
            setIsScreenXs(screenWidth < W_SM);
            setIsScreenSm(screenWidth >= W_SM && screenWidth < W_MD);
            setIsScreenMd(screenWidth >= W_MD && screenWidth < W_NORMAL);
            setIsScreenLg(screenWidth >= W_NORMAL && screenWidth < W_LG);
            setIsScreenXl(screenWidth >= W_LG);
        };

        // Initial check
        handleResize();
        // Event listener for window resize
        const resizeListener = () => {
            setIsScreenResizing(true);
            handleResize();
            setIsScreenResizing(false);
        };

        // Event listener for window resize
        window.addEventListener('resize', resizeListener);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    return {
        screenWidth: currScreenWidth,
        isScreenXs,
        isScreenSm,
        isScreenMd,
        isScreenLg,
        isScreenXl,
        isScreenResizing,
        isScreenUpXs: isScreenXs,
        isScreenUpSm: isScreenXs || isScreenSm,
        isScreenUpMd: isScreenXs || isScreenSm || isScreenMd,
        isScreenUpLg: isScreenXs || isScreenSm || isScreenMd || isScreenLg,
        isScreenUpXl: isScreenXs || isScreenSm || isScreenMd || isScreenLg || isScreenXl,
        isScreenBeyondSm: currScreenWidth >= W_SM,
        isScreenBeyondMd: currScreenWidth >= W_MD,
        isScreenBeyondLg: currScreenWidth >= W_LG,
        BREAKPOINT_SM: W_SM,
        BREAKPOINT_MD: W_MD,
        BREAKPOINT_LG: W_LG,
        BREAKPOINT_NORMAL: W_NORMAL,
        checkScreenWidthBounds,
    };

    /**
     * Check if current-window size falls within specified bounds.
     * @param {number|string} startWidth - Start window size.
     * @param {number|string} endWidth - End window size.
     * @return {boolean} Returns <code>true</code> if window-width falls within the specified bounds, otherwise <code>false</code>.
     */
    function checkScreenWidthBounds(startWidth, endWidth) {
        return currScreenWidth >= parseInteger(startWidth) && currScreenWidth <= parseInteger(endWidth);
    }
};

export default useScreenSize;
