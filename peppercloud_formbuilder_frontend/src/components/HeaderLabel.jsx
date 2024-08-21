import React, {useEffect} from 'react';

const HeaderLabel = React.memo(({
                                    className = '',
                                    style = {},
                                    children,
                                }) => {
    const TAG = "HeaderLabel";

    useEffect(() => {

    }, []);

    return (<>
            <h3 className={`w-100 text-center-force m-0 p-0 m-1mb-2 fw-bold text-dark ${className}`}
                style={style}>{children}
            </h3>
        </>
    )

    function fun() {

    }
});
export default HeaderLabel;
