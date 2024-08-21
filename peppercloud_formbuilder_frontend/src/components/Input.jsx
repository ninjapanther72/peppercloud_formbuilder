import React, {useEffect, useRef, useState} from "react";
import {
    changeStringCase,
    checkNull,
    checkNullStr,
    createTimeout,
    getDefValue,
    getDefValueStr,
    isBoolTrue,
    multSize,
    parseInteger,
    printError,
    subtractSize,
    trim
} from "../utils/AppUtils";
import {THEME} from "../config/AppConfig";
import {Button, Icon, IMsgButton} from "./index";

/**
 * @example
 *     <Input
 *                                                     variant={'primary or secondary or danger or info or success or warning'}
 *                                                     wrapperClassName={InputCls._3_12}
 *                                                     className={``}
 *                                                     type={`text`}
 *                                                     name={FormFields.paymentsType.column}
 *                                                     id={FormFields.paymentsType.column + recordIndex}
 *                                                     msg={!checkNullFormValue(FormFields.paymentsType, recordIndex) ? EMPTY_MSG : INVALID_MSG}
 *                                                     showMsg={showReqFieldMsg(FormFields.paymentsType, recordIndex)}
 *                                                     placeholder={FormFields.paymentsType.label}
 *                                                     value={getFormDataValue(FormFields.paymentsType, recordIndex)}
 *                                                     pattern={Patterns.plainText}
 *                                                     validate={false}
 *                                                     required={false}
 *                                                     floatingLabel={FLOATING_LABEL}
 *                                                     placeholderAsLabel={!FLOATING_LABEL}
 *                                                     onChange={(e, isValid) => {
 *                                                         const value = e.target.value;
 *                                                         if (isValid) updateFormField(FormFields.paymentsType, value, recordIndex);
 *                                                     }}
 *                                                 />
 */
const Input = React.memo(({
                              //ClassName
                              className = "",
                              wrapperClassName = "",
                              innerWrapperClassName = "",
                              controlClassName = "",
                              controlIconClassName = "",
                              labelClassName = "",
                              tooltipClassName = "",
                              errorClassOnInvalid = "danger",
                              iconColor = "black",
                              iconSize = "22px",
                              iconGap = "10px",
                              variant = THEME, //Style
                              wrapperStyle = {},
                              innerWrapperStyle = {},
                              pe = '2',
                              ps = '2',
                              pb = 1,
                              pt = 1,

                              forwardRef,
                              id,
                              useBlur = false,
                              showDefMsg = true,
                              showDefMsgOverride = false,
                              appendRandomClass = false,
                              errorTimeoutMS = 2500,
                              asTextArea = false,
                              transition = true,
                              showMsgOnNonValidate = false,
                              iMsg = '',

                              //Text
                              rows,
                              cols,
                              value,
                              defaultValue,
                              placeholder = "Enter text",
                              inputValueState,
                              inputValueSetState,

                              //icon
                              leftIcon = "",
                              rightIcon = "",
                              leftIconTooltip = "",
                              rightIconTooltip = "",
                              onLeftIconClick,
                              onRightIconClick,
                              rightComponent,
                              leftIconStyle = {},
                              iconStyle = {},
                              iconClassName = "",

                              //label
                              label = "",
                              labelSize = "12px",
                              labelColor = "#3D3B3E",
                              labelStyle = {},
                              floatingLabel = false,
                              placeholderAsLabel = true,
                              showLabel = true,
                              overrideInvalid = false,

                              //Validation msg
                              msg = "",
                              msgTextSize = "9px",
                              msgHeight = "14px",
                              msgStyle = {},
                              msgColor = "#E43217",
                              msgClassName = "",
                              italicMsg = false,
                              showMsg = true,
                              showMsgOverride = true,
                              animateMsg = false,

                              //Other
                              type = "text",
                              name = "text",
                              title = "",
                              onChange,
                              onPaste,
                              onCut,
                              capitalizeOnType = false,
                              onKeyUp,
                              onKeyPress,
                              onKeyDown,
                              onFocus,
                              onBlur,
                              onClick,
                              onError,
                              error = false,
                              success = false,
                              info = false,
                              hidden = false,
                              required = false,
                              disabled = false,
                              validate = false,
                              showClear = false,
                              showPasswordToggle = true,
                              style = {},
                              controlStyle = {},
                              maxLength,
                              accept,
                              autoComplete,// 'none' | 'inline' | 'list' | 'both' | undefined;
                              min,
                              max,
                              minLength,
                              pattern,
                              readOnly,
                              wrap = "wrap",
                              controlColor = "gray",
                              controlSize = "24px",
                              ...rest
                          }) => {
    let TAG = "Input";

    let inputRef = useRef();

    const [isHover, setIsHover] = useState(false);
    const [isFloating, setIsFloating] = useState(false);
    const [inputType, setInputType] = useState(type);
    const [overrideMsg, setOverrideMsg] = useState(false);
    const [inputMsg, setInputMsg] = useState(msg);
    const [inputMsgColor, setInputMsgColor] = useState(msgColor);


    const [nativeValue, setNativeValue] = useState('');

    const [showValidationMsg, setShowValidationMsg] = useState(false)
    const [isInvalid, setIsInvalid] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        setIsFloating(checkNullStr(value));
    }, [value]);
    useEffect(() => {
        try {
            setIsFloating(isInputGo() ? checkNullStr(getInputRef().value) || checkNullStr(getInputRef().innerText) || checkNullStr(getInputRef().innerHTML) : checkNullStr(value));
        } catch (e) {
            printError(TAG, e);
        }
    }, [isInputGo() ? (checkNullStr(getInputRef().value) || checkNullStr(getInputRef().innerText) || checkNullStr(getInputRef().innerHTML)) : value]);

    useEffect(() => {
        setInputMsg(msg);
    }, [msg]);
    useEffect(() => {
        setInputMsgColor(msgColor);
    }, [msgColor]);

    return (!hidden && createWidget())

    function createWidget() {
        return <div
            className={getWrapperClass()}
            style={{...wrapperStyle}}>
            <div className={`d-flex jc-start flex-wrap fd-row ${innerWrapperClassName} ${transition ? ' transition ' : ''}`}
                 style={{...innerWrapperStyle}}
            >
                {/*floating-label*/}
                {(canShowFloatingLabel()) && <label className={`floating-label fw-bold fs-sm text-input-label w-100 transition text-nowrap overflow-hidden   text-nowrap justify-content-start text-start px-1 py-0 me-2  
                    ${labelClassName} mt-0 pb-0 pt-0
                    ${variant}
                    ${isBoolTrue(placeholderAsLabel) ? '' : ''}
                    ${!isBoolTrue(floatingLabel) ? '' : ''}
                    ${isInvalid ? (getDefValue(errorClassOnInvalid, "")) : ""}`}
                                                    style={{marginBottom: ".2rem", height: "auto", ...labelStyle}}>

                    <span>{getLabelText()}</span>
                    {checkNullStr(iMsg) && <span className={'ms-2 text-wrap text-break'}>
                          <IMsgButton tooltip={iMsg}/>
                    </span>}
                </label>}

                {/*Left icon*/}
                <div className={`d-flex w-100 flex-nowrap fd-row jc-start al-center m-0 p-0 position-relative`}>
                    {checkNullStr(leftIcon) && !isTypeFile() && !asTextArea && <Icon
                        className={`input-icon position-absolute text-darkx px-1 ${leftIcon} ${iconClassName}`}
                        tooltip={leftIconTooltip}
                        onClick={onLeftIconClick}
                        style={{left: iconGap, fontSize: iconSize, color: iconColor, ...iconStyle, ...leftIconStyle}}/>}

                    {/*Create input field*/}
                    {isBoolTrue(asTextArea) ? createTextArea() : createInput()}

                    {/*Right icon*/}
                    {checkNullStr(rightIcon) && !isTypeFile() && !asTextArea && <Icon
                        className={`input-icon position-absolute xtext-dark px-2 ${rightIcon} ${iconClassName}`}
                        tooltip={rightIconTooltip}
                        onClick={onRightIconClick}
                        style={{right: iconGap, fontSize: iconSize, color: iconColor, ...iconStyle}}/>}
                    {rightComponent && rightComponent}

                    {/*Clear control*/}
                    {showClear && <Button
                        className={`bg-t shadow-none p-1 circular ${controlClassName} `}
                        iconClass={`bi bi-x text-dark fw-bold ${controlIconClassName}`}
                        width={controlSize}
                        height={controlSize}
                        fontSize={"15px"}
                        disabled={disabled}
                        // tooltip={"Clear"}
                        style={{
                            margin: "1.5px", marginLeft: "-" + subtractSize(controlSize, 5), ...controlStyle
                        }}
                        onClick={clearInput}
                    />}


                    {/*Password toggle*/}
                    {(isTypePw() && isBoolTrue(showPasswordToggle)) && <Button
                        className={`shadow-none p-1 circular text-dark ${controlClassName} `}
                        iconClass={`text-${controlColor} ${showPassword ? 'bi bi-eye ' : 'bi bi-eye-slash'}`}
                        width={controlSize}
                        height={controlSize}
                        fontSize={"15px"}
                        disabled={disabled}
                        // tooltip={showPassword?"Hide":"Show"}
                        style={{
                            margin: "1.5px", marginLeft: "-" + multSize(controlSize, 1.2), ...controlStyle
                        }}
                        onClick={handleTogglePassword}
                    />}
                </div>
            </div>


            {(isBoolTrue(showMsgOverride)) &&
                <label className={`px-1 mb-0 pb-0 fw-bold transition text-nowrap overflow-hidden text-start d-flex text-nowrap ${msgClassName}x`}
                       style={{
                           fontStyle: isBoolTrue(italicMsg) ? "italic" : "normal",
                           color: inputMsgColor,
                           marginTop: ".1rem",
                           fontSize: msgTextSize,
                           height: msgHeight,
                           ...msgStyle
                       }}>
                    {isBoolTrue(showDefMsgOverride)
                        ? getDefValueStr(msg, inputMsg)
                        : ((overrideMsg && isBoolTrue(showDefMsg)) ? inputMsg : msg)}
                </label>}
        </div>
    }

    function createInput() {
        return <input
            value={value}
            defaultValue={defaultValue}
            // defaultValue={inputDefValue}
            ref={inputRef}
            autoComplete={autoComplete}
            className={getInputClass()}
            id={id}
            name={name}
            disabled={disabled}
            type={isTypePw() ? (showPassword ? 'text' : 'password') : type}
            // type={inputType}
            placeholder={placeholder}
            style={{
                // paddingTop: isTypeFile() ? ".2rem" : "",
                // paddingBottom: isTypeFile() ? "0rem" : "",
                // paddingRight: ( isTypePw() || checkNullStr(rightIcon)) ? "2rem !important" : "",
                // paddingLeft: (checkNull(leftIcon, "") || asTextArea) && !isTypeFile() ? multSize(iconSize, 2) : ".6rem",
                // paddingRight: isTypePw() ? multSize(iconSize, 2) + ' !important' : ".6rem !important",
                ...style
            }}
            maxLength={maxLength}
            minLength={minLength}
            onClick={onClick}
            onChange={handleOnChange}
            onPaste={handleOnPaste}
            onCut={handleOnCut}
            onFocus={(e) => {
                if (checkNull(onFocus)) onFocus(e);
                setIsFloating(true);
            }}
            onBlur={handleBlur}
            onKeyUp={onKeyUp}
            onKeyPress={onKeyPress}
            onKeyDown={handleKeyDown}
            accept={accept}
            min={(min + "")}
            max={(max + "")}
            pattern={pattern}
            readOnly={readOnly}
            required={required}
            {...rest}
        />
    }

    function createTextArea() {
        return <textarea
            value={value}
            ref={inputRef}
            rows={rows}
            cols={cols}
            className={getInputClass() + " scroll scroller"}
            id={id}
            name={name}
            title={title}
            disabled={disabled}
            placeholder={placeholder}
            style={{...style}}
            defaultValue={defaultValue}
            maxLength={maxLength}
            minLength={minLength}
            onClick={onClick}
            onChange={handleOnChange}
            autoComplete={autoComplete}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            required={required}
            {...rest}
        />
    }

    function handleKeyDown(e) {
        if (isBoolTrue(validate) && checkNullStr(pattern)) {
            const {value, selectionStart, selectionEnd} = getInputRef();
            if (e.key === 'Backspace') {
                // Prevent the default backspace behavior
                e.preventDefault();
                // Delete the character one by one
                if (selectionStart !== selectionEnd) {
                    const newValue = value.slice(0, selectionStart) + value.slice(selectionEnd);
                    getInputRef().value = newValue;
                    setNativeValue(newValue);
                    if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, true);
                } else {
                    const newValue = value.substring(0, value.length - 1);
                    setNativeValue(newValue);
                    getInputRef().value = newValue;
                    if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, true);
                }
            }
        }
        if (checkNull(onKeyDown)) onKeyDown(e, true);
    }

    function handleOnPaste(e) {
        if (isBoolTrue(validate) && checkNullStr(pattern)) {
            const {value, selectionStart, selectionEnd} = getInputRef();
            const newValue = value.slice(0, selectionStart) + value.slice(selectionEnd);
            getInputRef().value = newValue;
            setNativeValue(newValue);
            if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, true);
        }
        if (checkNull(onPaste)) onPaste(e);
    }

    function handleOnCut(e) {
        if (isBoolTrue(validate) && checkNullStr(pattern)) {
            const {value, selectionStart, selectionEnd} = getInputRef();
            const newValue = value.slice(0, selectionStart) + value.slice(selectionEnd);
            getInputRef().value = newValue;
            setNativeValue(newValue);
            if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, true);
        }
        if (checkNull(onCut)) onCut(e);
    }

    function handleOnChange(e) {
        let changeValue = e.target.value + "";
        if (isBoolTrue(capitalizeOnType)) changeValue = changeStringCase(changeValue, "upper");
        setIsFloating(checkNullStr(changeValue));
        setNativeValue(changeValue);
        if (isBoolTrue(validate) && checkNullStr(pattern)) {
            const sanitizedInput = changeValue.replace(pattern, '');
            setNativeValue(sanitizedInput);
            setInputMsg('');

            if (pattern.test(changeValue)) {
                setShowValidationMsg(false);

                if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, true);

                const {selectionStart, selectionEnd} = getInputRef();
                if (selectionStart !== selectionEnd) {
                    getInputRef().value = '';
                }
                // if (checkNull(onKeyDown)) onKeyDown(e, true);
                // if (checkNull(onKeyPress)) onKeyPress(e, true);
            } else {
                // triggerActionsOnInvalid(e, changeValue);
                // if (!isBoolTrue(overrideInvalid)) clearInput();
                setShowValidationMsg(true);
                setIsInvalid(true);
                setInputMsg('Invalid value');
                if (errorTimeoutMS > 0) {
                    // if (errorTimeoutMS > 0 && checkNullStr(changeValue)) {
                    createTimeout(() => {
                        setIsInvalid(false);
                        setShowValidationMsg(false);
                    }, errorTimeoutMS)
                }
                if (isBoolTrue(overrideInvalid)) if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, false);
                // if (checkNull(onKeyDown)) onKeyDown(e, false)
                // if (checkNull(onKeyPress)) onKeyPress(e, false)
                // if (checkNull(onError)) onError(e, changeValue)
            }
        } else {
            if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, true)
        }
        setIsInvalid(false);
    }

    function handleBlur(e) {
        try {
            if (isBoolTrue(useBlur)) {
                // e.preventDefault();
                // e.stopPropagation();
                // if (checkNull(onBlur)) onBlur(e);
                if (!checkNullStr(value)) {
                    setIsFloating(false);
                }
                if (isBoolTrue(required) && (!checkNullStr(value) || !checkNullStr(nativeValue))) {
                    // setIsInvalid(true);
                    setShowValidationMsg(true);
                    setOverrideMsg(true);
                    setInputMsgColor('red');
                    setInputMsg('Required field');
                } else {
                    // setIsInvalid(isInvalid);
                    setShowValidationMsg(showValidationMsg);
                    setOverrideMsg(false);
                    setInputMsgColor(msgColor);
                    setInputMsg(msg);
                }
            }
            if (checkNull(onBlur)) onBlur(e);
        } catch (e) {
            printError(TAG, e)
        }
    }

    function triggerActionsOnInvalid(e, changeValue) {
        setShowValidationMsg(true);
        setIsInvalid(true);
        if (errorTimeoutMS > 0 && checkNullStr(changeValue)) {
            createTimeout(() => {
                setIsInvalid(false);
                setShowValidationMsg(false);
            }, errorTimeoutMS)
        }
        if (checkNull(onChange) && !isBoolTrue(readOnly)) onChange(e, false);
        // if (checkNull(onKeyDown)) onKeyDown(e, false)
        // if (checkNull(onKeyPress)) onKeyPress(e, false)
        if (checkNull(onError)) onError(e, changeValue)
    }

    function handleTogglePassword() {
        if (isInputGo()) {
            if (!showPassword) {
                // getInputRef().type = isTypePw();
                // setInputType(isTypePw());
            } else {
                // getInputRef().type = "text";
                // setInputType("text");
            }
        }
        setShowPassword(!showPassword);
        focusInput();
    }

    function isInputEmpty() {
        return !(isInputGo() ? checkNull(getInputRef().value, "") : false)
    }

    function clearInput() {
        if (isInputGo()) {
            getInputRef().value = ""
            focusInput()
        }
    }

    function isInputGo() {
        return checkNull(inputRef) && checkNull(getInputRef())
    }

    function getInput() {
        return (isInputGo()) ? getInputRef() : null;
    }

    function focusInput() {
        if (isInputGo()) {
            try {
                getInputRef().focus();
                // $(getInput()).focus();
            } catch (e) {
                printError(TAG, e)
            }
        }
    }

    function getWrapperClass() {
        return `input-wrapper d-flex flex-column overflow-visible p-0 transition 
            ${wrapperClassName} 
            ${(floatingLabel && canShowFloatingLabel()) ? 'floating-input-wrapper' : ''}
            ${(floatingLabel && isFloating && canShowFloatingLabel()) ? 'floating' : ''}
            `
    }

    function getInputClass() {
        return `form-control form-group m-0 p-0 py-0x my-0 w-100  
          ${(checkNullStr(leftIcon)) ? `left-iconx ps-${parseInteger(ps) * 2}` : `ps-${ps} pb-${pb} pt-${pt} pb-${pb}`}
          ${className} 
          ${variant} 
          ${isBoolTrue(error) ? 'error' : ''}
          ${isBoolTrue(success) ? 'success' : ''}
          ${isBoolTrue(info) ? 'info' : ''}
          ${isBoolTrue(transition) ? 'transition' : ''}
          ${isBoolTrue(disabled) ? 'disabled' : ''}
          ${(isTypePw() || checkNullStr(rightIcon) || checkNull(rightComponent)) ? `right-iconx pe-${parseInteger(pe) * 2}` : `pe-${pe}`}
          ${isInvalid ? (getDefValue(errorClassOnInvalid, "")) : ""}
        `
    }

    function getLabelText() {
        const text = checkNullStr(label) ? label : (isBoolTrue(placeholderAsLabel) && (checkNullStr(placeholder)) ? placeholder : "");
        return <span className={'p-0 m-0'}>
            {(text + "").replaceAll("*", "").trim()}
            {(isBoolTrue(required) && checkNullStr(label)) && <span className={'m-0 p-0 text-danger select-none'}>*</span>}
        </span>
    }

    function canShowFloatingLabel() {
        return isBoolTrue(showLabel) && (checkNullStr(getLabelText()) || (isBoolTrue(placeholderAsLabel) && checkNullStr(placeholder)));
        // return true;
    }

    function isTypeFile() {
        return type === "file";
    }

    function getInputRef() {
        if (forwardRef) {
            return forwardRef.current;
        } else {
            return inputRef.current;
        }
    }

    function isTypePw() {
        return trim(type).toLowerCase() == "password" || trim(type).toLowerCase() == "pin";
    }

});


export default Input;


