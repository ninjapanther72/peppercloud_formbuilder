import React, {useEffect} from "react";
import {checkNullStr, getDefJsonValue, setTabTitle} from "../utils/AppUtils.js";
import {Flexbox, Image, Label, Section} from "../components";
import {AppName} from "../config/AppConfig";
import AppLogo from "../assets/images/AppLogo.png";
import {Link} from "react-router-dom";

const AppInterface = React.memo(({
                                     className,
                                     contentClassName,
                                     children,
                                     label,
                                     contentStyle = {},
                                     labelProps = {},
                                     ...rest
                                 }) => {
    const TAG = "AppInterface";

    useEffect(() => {
        setTabTitle(label);
    }, [label]);


    return (<>
        <div className={`w-100 m-0 p-0 position-relative ${className}`}
             {...rest}
        >
            {/*Navbar*/}
            <div className={'position-fixed w-100 bg-white'}style={{top:0,left:0,zIndex:10}}>
                <Flexbox className={'px-2 py-2 risen-xs'}>
                    {/*left*/}
                    <Link to={'/'} className={'td-none'}>
                        <Flexbox className={''} justifyAt={'start'} alignAt={'center'}>
                            <Image
                                wrapperClassName={''}
                                src={AppLogo}
                                width={'34px'}
                                height={'34px'}
                            />
                            <Label className={'cursor-pointer fw-bold px-1 text-dark fs-md-lg text-nowrap select-none'}>{AppName}</Label>
                        </Flexbox>
                    </Link>
                </Flexbox>
            </div>

            <div className={`w-100 mt-5 container ${contentClassName}`}>
                <div
                    className={`m-0 w-100 d-flex jc-center al-start`}>
                    <Section
                        className={`m-0 px-3 py-1 overflow-x-hidden w-100 mt-1`}
                        // bg={''}
                        overflow={'hidden'}
                        shadowVariant={''}
                        contentClassName={'h-100'}
                        style={{minHeight: '92vh', ...contentStyle}}
                        borderless={true}>
                        {createLabel()}
                        {children}
                    </Section>
                </div>
            </div>
        </div>
    </>);

    function createLabel() {
        return checkNullStr(label) &&
            <Label className={`m-0 p-0 fs-xl text-center-force fw-bold my-1x mb-1x`}
                   color={getDefJsonValue(labelProps, 'color', 'black')}
                   widthClass={'100'}
                   textAt={'center'}
                   style={{
                       ...getDefJsonValue(labelProps, 'style', {})
                   }}
                   {...labelProps}>
                {label}
            </Label>
    }
});

export default AppInterface;
