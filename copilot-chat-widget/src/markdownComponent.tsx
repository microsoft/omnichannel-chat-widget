
import Markdown from 'react-markdown';


interface MarkdownProps {
    content: string
}

const MarkdownComponent = (props: MarkdownProps) => {

    return renderWithReactMarkdown(props.content);
}

function renderWithReactMarkdown(val: string) {
    return (
        <Markdown
            children={val}
            components={{
                // a: (props) => {
                //     const {children, className, node, ...rest} = props
                //     console.log("debugging: link children received: ", children, " className: ", className, " node: ", node);
                //     return (
                //         <span>{children}</span>
                //     )
                // },
                em: (props) => {
                    const {children, className, node, ...rest} = props
                    return (
                        <strong {...rest} className={className}>
                            {children}
                        </strong>
                    )
                },
                // strong: (props) => {
                //     const {children, className, node, ...rest} = props
                //     // console.log("debugging: children received: ", children, " className: ", className, " props: ", props);
                //     return (
                //         <h1>
                //             {children}
                //         </h1>
                //     )
                // },
                code: (props) => {
                    const {children, className, node, ...rest} = props
                    // console.log("debugging: children received: ", children, " className: ", className);
                    // return (
                    //     <div id="testId">{children + " tttdddvv"}</div>
                    // )
                    return (
                        <code {...rest} className={className} style={{background: "yellow"}}>
                            {children}
                        </code>
                    )
                }
            }} 
        />
    )
}


export default MarkdownComponent;
