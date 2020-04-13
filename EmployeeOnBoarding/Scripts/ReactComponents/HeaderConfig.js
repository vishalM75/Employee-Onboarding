"use strict";
let FormComponenthis = null;

class EOBHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        FormComponenthis = this;
        FormComponenthis.Modal = React.createRef();
    }
    componentWillMount() {

    }
    componentDidMount() {
    }

    render() {
        return (
            <div>
                <table>
                    <tr>
                        <td>
                            This is a demo header text
                        </td>
                        <td>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        </td>
                        <td>
                        </td>
                    </tr>
                </table>
            </div>
        );

    }
}
const dom = document.getElementById("HeaderConfig")
ReactDOM.render(
    <EOBHeader />,
    dom
);  