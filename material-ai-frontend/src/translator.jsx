import DynamicMuiLoader from "./components/DynamicMuiLoader"



export const INPUT_JSON = {
    componentName: "Box",
    children: [
        {
            componentName: "Button",
            props: {
                variant: "contained",
                style: {
                    width: '1000px'
                },
            },
            children: [
                "Submit"
            ]
        }
    ]
}



export function translate(component) {
    if (typeof component == 'string') return <>{component}</>

    let children = component.children || []
    let translated_children = []

    for (let child of children) {
        translated_children.push(translate(child))
    }

    const key = component.componentName;

    return <DynamicMuiLoader key={key} componentName={key} {...component.props} children={translated_children} />
}


