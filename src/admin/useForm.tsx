import { HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode, useMemo, useState } from "react";
import { ErrorInfo } from "remult";

export function useInputArea<T>(options: UseInputAreaOptions<T>) {
    const [state, setState] = useState(options.state || {});
    const [error, setError] = useState();
    const sections = useMemo(() => {
        const result: Section[] = [];
        let i = 0;
        const getKeyProps = () => {
            const key = i++;
            return () => ({ key }) 
        }
        const render = options.renderInput || (props =>
            <input {...getInputProps(props)} />);
        for (const arrayLevel1 of options.layout) {
            const lines: Line[] = [];
            for (const arrayLevel2 of arrayLevel1) {
                const items: Field[] = [];
                if (Array.isArray(arrayLevel2)) {
                    items.push(...arrayLevel2.map(x => buildFromFieldMetadata(x!)));
                }
                else items.push(buildFromFieldMetadata(arrayLevel2!));

                lines.push({ items, getProps: getKeyProps() });
            }
            result.push({ lines, getProps: getKeyProps() });
        }
        function buildFromFieldMetadata(field: FieldItem): Field {
            const key = field.key;
            let errorText: string | undefined = undefined;
            if (options.error?.modelState)
                //@ts-ignore
                errorText = options.error?.modelState[key];
            //@ts-ignore
            const value = state[key] || '';

            const props: FieldRenderProps = {
                key,
                label: field.caption!,
                error: Boolean(errorText),
                errorText,
                value,
                inputType: field.inputType,
                setValue: newValue => {
                    if (!field.readonly)
                        //@ts-ignore
                        setState({
                            ...state,
                            [key]: newValue
                        });
                }


            }

            return {
                render: () => (field.renderInput || render)(props)
            }
        }
        return result;

    }, [options.layout, state]);

    return { sections, state, setState, error, setError };
}

export interface FieldRenderProps {
    key: string;
    label: string;
    error: boolean;
    errorText?: string;
    readonly?: boolean;
    inputType?: HTMLInputTypeAttribute;
    value: any;
    setValue: (newValue: any) => void;
}

export interface Field {

    render(): ReactNode;
}
export interface Section {
    lines: Line[];
    getProps(): KeyedProps;
}
export interface Line {
    items: Field[];
    getProps(): KeyedProps;
}



export interface KeyedProps {
    key: React.Key
}

export interface FieldItem {
    key: string;
    caption?: string;
    readonly?: boolean;
    inputType?: HTMLInputTypeAttribute;
    renderInput?: FieldRenderer;
}
export declare type Layout = (FieldItem | undefined | (FieldItem | undefined)[])[][];
export declare type FieldRenderer = (props: FieldRenderProps) => ReactNode;
export interface UseInputAreaOptions<T> {
    state?: T,
    error?: ErrorInfo<T>,
    layout: (FieldItem | undefined | (FieldItem | undefined)[])[][],
    renderInput?: FieldRenderer;
}

export function getInputProps(props: FieldRenderProps): InputHTMLAttributes<any> & KeyedProps {

    switch (props.inputType) {
        case "checkbox":
            return {
                key: props.key,
                checked: Boolean(props.value),
                onChange: e => props.setValue(e.target.checked),
                type: props.inputType
            }
    }
    return {
        key: props.key,
        placeholder: props.label,
        value: props.value || '',
        onChange: e => props.setValue(e.target.value)
    }
}