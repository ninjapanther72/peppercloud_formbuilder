import React, {useRef} from 'react';
import {checkNullStr, printError} from "../utils/AppUtils";
import {Label} from "./index";

const EditableDiv = React.memo(({
                                    className = '',
                                    labelClassName = '',
                                    style = {},
                                    labelStyle = {},
                                    onChange,
                                    placeholder,
                                    required = false,
                                    label,
                                    value,
                                    color = 'black',
                                }) => {
    // const [content, setContent] = useState(value);
    const divRef = useRef(null);

    const handleInput = (e) => {
        try {
            const value = (e.target.innerText+'').replace(placeholder,'');

            // Store the cursor position
            const selection = window.getSelection();
            if (onChange) onChange(e, value);
            if (checkNullStr(value)) {
                const range = selection.getRangeAt(0);
                const cursorPosition = range.startOffset;

                // After the state update, restore the cursor position
                setTimeout(() => {
                    const restoredRange = document.createRange();
                    restoredRange.setStart(divRef.current.firstChild, cursorPosition);
                    restoredRange.setEnd(divRef.current.firstChild, cursorPosition);
                    selection.removeAllRanges();
                    selection.addRange(restoredRange);
                }, 0);
            }
        } catch (error) {
            printError(error);
        }
    };

    return (
        <div>
            {checkNullStr(label) &&
                <Label className={`${labelClassName}`} style={labelStyle}>{label}</Label>}
            <div
                className={`form-control ${className}`}
                ref={divRef}
                contentEditable={true}
                onInput={handleInput}
                suppressContentEditableWarning={true}
                // dangerouslySetInnerHTML={{__html:value}}
                style={{
                    color: checkNullStr(value) ? color : '#A7A7A7',
                    ...style
                }}
            >
                {checkNullStr(value) ? value : placeholder}
            </div>
        </div>
    );
});

export default EditableDiv;
