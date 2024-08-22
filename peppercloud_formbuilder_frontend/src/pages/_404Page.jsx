import React, {useEffect} from 'react';
import {setTabTitle} from "../utils/AppUtils";
import {useNavigate} from "react-router-dom";
import {ModuleRouteUrls, Modules} from "../config/AppConfig";
import {Button} from "../components";

const _404Page = React.memo(() => {
    const TAG = '_404Page';
    const navigate = useNavigate();

    useEffect(() => {
        setTabTitle('404');
    }, []);
    return (<div className={'position-relative w-100 h-100'}>
        <div id={"error-page"}>
            <div className={"content"}>
                <h2 className="header" data-text="404">
                    404</h2>
                <h4 className={''}>
                    {`Opps! Page not found`}
                </h4>
                <p className={'fs-normal'}>
                    {`Sorry, the page you're looking for doesn't exist.`}
                </p>
                <div className={"btnsxmt-3"}>
                    <Button
                        className={'px-5 fs-xl fw-semi-bold'}
                        text={'Go to Home'}
                        sleek={true}
                        variant={'primary'}
                        href={ModuleRouteUrls[Modules.Home]}
                    />
                </div>

                <div className={"mt-4"}>
                    <label
                        className={'px-2 py-1 fs-normal m-0 p-0 footer-link select-none'}
                        onClick={() => {
                            navigate(-1);
                        }}
                    >Go back</label>
                </div>
            </div>
        </div>
    </div>);
});

export default _404Page;
