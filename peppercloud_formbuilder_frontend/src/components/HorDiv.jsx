import React from 'react';

const HorDiv = React.memo(({
                               className = "",
                               variant = 'gray-dark',
                               width = '1.5px',
                               style = {}
                           }) => {
    return (<hr className={`border-${variant} w-100 m-0 p-0 ${className}`}
                style={{borderColor: variant, borderWidth: width, ...style}}/>)
});
export default HorDiv;
